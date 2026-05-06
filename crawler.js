const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const moment = require('moment');

const DEFAULT_CONCURRENCY = 8;
const DEFAULT_CACHE_TTL_MINUTES = 30;
const DEFAULT_FAILURE_COOLDOWN_MINUTES = 20;
const DEFAULT_CRITICAL_FAILURE_THRESHOLD = 1;
const CACHE_FILE = path.join(__dirname, 'public', 'rss-cache.json');
const STATUS_FILE = path.join(__dirname, 'public', 'crawl-status.json');

const DEFAULT_CRITICAL_SOURCES = [
  'github all',
  '中国新闻网 即时新闻',
  'solidot'
];

function readFeeds(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function stripHtml(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizePubDate(pubDate) {
  if (!pubDate) return '';

  const parsed = new Date(pubDate);
  if (!Number.isNaN(parsed.getTime())) {
    return moment(parsed).format('YYYY-MM-DD HH:mm:ss');
  }

  const momentParsed = moment(pubDate, [
    'ddd, DD MMM YYYY HH:mm:ss ZZ',
    'ddd, DD MMM YYYY HH:mm:ss Z',
    'YYYY-MM-DD HH:mm:ss',
    moment.ISO_8601
  ], true);

  if (momentParsed.isValid()) {
    return momentParsed.format('YYYY-MM-DD HH:mm:ss');
  }

  return '';
}

function dedupeByTitleAndLink(items) {
  const seen = new Set();
  const result = [];

  items.forEach((item) => {
    const key = `${item.title || ''}__${item.link || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  });

  return result;
}

function keepRecentThreeMonths(items) {
  const threshold = moment().subtract(3, 'months').valueOf();
  return items.filter((item) => {
    if (!item.pub_date) return true;
    const ts = new Date(item.pub_date).getTime();
    return Number.isNaN(ts) ? true : ts >= threshold;
  });
}

function writeItemsJson(items) {
  const targetPath = path.join(__dirname, 'public', 'rss-items.json');
  fs.writeFileSync(targetPath, JSON.stringify(items, null, 2));
  console.log(`Saved ${items.length} items to ${targetPath}`);
}

function writeStatusJson(status) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
  console.log(`Saved crawl status to ${STATUS_FILE}`);
}

function parseEnvInt(name, defaultValue) {
  const parsed = Number.parseInt(process.env[name] || '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
}

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Cache file parse failed, ignoring cache: ${error.message}`);
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function getCacheKey(feed) {
  return `${feed.category}__${feed.title || feed.name}__${feed.url}`;
}

function getCachedItems(cache, feed, ttlMs) {
  const key = getCacheKey(feed);
  const record = cache[key];
  if (!record || !record.fetched_at || !Array.isArray(record.items)) {
    return null;
  }

  const fetchedTs = new Date(record.fetched_at).getTime();
  if (Number.isNaN(fetchedTs)) {
    return null;
  }

  const isFresh = Date.now() - fetchedTs <= ttlMs;
  if (!isFresh) {
    return null;
  }

  return record.items;
}

function setCachedItems(cache, feed, items) {
  const key = getCacheKey(feed);
  cache[key] = {
    fetched_at: new Date().toISOString(),
    items,
    failure: null
  };
}

function isSourceInFailureCooldown(cache, feed, cooldownMs) {
  const key = getCacheKey(feed);
  const record = cache[key];
  const failure = record?.failure;

  if (!failure || !failure.at) {
    return false;
  }

  const failureTs = new Date(failure.at).getTime();
  if (Number.isNaN(failureTs)) {
    return false;
  }

  return Date.now() - failureTs <= cooldownMs;
}

function setFailureState(cache, feed, errorMessage) {
  const key = getCacheKey(feed);
  const prev = cache[key] || {};
  cache[key] = {
    ...prev,
    failure: {
      at: new Date().toISOString(),
      message: errorMessage
    }
  };
}

function clearFailureState(cache, feed) {
  const key = getCacheKey(feed);
  if (!cache[key]) {
    return;
  }
  cache[key] = {
    ...cache[key],
    failure: null
  };
}

async function fetchFeed(feed, cache, ttlMs, cacheEnabled, failureCooldownMs) {
  if (cacheEnabled && isSourceInFailureCooldown(cache, feed, failureCooldownMs)) {
    const key = getCacheKey(feed);
    const reason = cache[key]?.failure?.message || 'recent failure';
    console.warn(`Circuit open (skip): ${feed.url} (${reason})`);
    return {
      items: [],
      skippedByCircuit: true,
      failed: true,
      fromCache: false,
      errorMessage: reason
    };
  }

  if (cacheEnabled) {
    const cachedItems = getCachedItems(cache, feed, ttlMs);
    if (cachedItems) {
      console.log(`Cache hit: ${feed.url} (${cachedItems.length} items)`);
      return {
        items: cachedItems,
        skippedByCircuit: false,
        failed: false,
        fromCache: true
      };
    }
  }

  const parser = new Parser();
  const { default: fetch } = await import('node-fetch');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(feed.url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const xml = await res.text();
    clearTimeout(timeout);
    const parsedFeed = await parser.parseString(xml);
    const items = (parsedFeed.items || []).map(item => ({
      id: `${feed.category}-${feed.title || feed.name}-${item.link || item.guid || item.title}`,
      feed_name: feed.title || feed.name,
      feed_url: feed.url,
      category: feed.category,
      title: item.title,
      link: item.link,
      pub_date: normalizePubDate(item.pubDate),
      author: item.author,
      description: stripHtml(item.contentSnippet || item.summary || item.content || item.description || ''),
      content: stripHtml(item.content || item['content:encoded'] || item.description || '')
    }));
    console.log(`Fetched ${items.length} items from ${feed.url}`);

    if (cacheEnabled) {
      setCachedItems(cache, feed, items);
      clearFailureState(cache, feed);
    }

    return {
      items,
      skippedByCircuit: false,
      failed: false,
      fromCache: false
    };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.error(`Timeout fetching ${feed.url}`);
    } else if (err.message === 'Feed not recognized as RSS 1 or 2.') {
      console.warn(`Invalid RSS feed: ${feed.url}`);
    } else {
      console.error(`Error fetching ${feed.url}: ${err.message}`);
    }

    if (cacheEnabled) {
      setFailureState(cache, feed, err.message || 'unknown error');
    }

    return {
      items: [],
      skippedByCircuit: false,
      failed: true,
      fromCache: false,
      errorMessage: err.message || 'unknown error'
    };
  }
}

function resolveCriticalKeywords() {
  const raw = process.env.CRAWL_CRITICAL_SOURCES;
  if (!raw || !raw.trim()) {
    return DEFAULT_CRITICAL_SOURCES.map((item) => item.toLowerCase());
  }

  return raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isCriticalFeed(feed, criticalKeywords) {
  const title = String(feed.title || feed.name || '').toLowerCase();
  const url = String(feed.url || '').toLowerCase();
  return criticalKeywords.some((keyword) => title.includes(keyword) || url.includes(keyword));
}

async function main() {
  const startedAt = new Date();
  const startedMs = Date.now();

  const feedsData = readFeeds('./public/rss-feeds.json');
  const feeds = feedsData.feeds;
  const allItems = [];

  const concurrency = parseEnvInt('CRAWL_CONCURRENCY', DEFAULT_CONCURRENCY);
  const cacheTtlMinutes = parseEnvInt('CRAWL_CACHE_TTL_MINUTES', DEFAULT_CACHE_TTL_MINUTES);
  const failureCooldownMinutes = parseEnvInt('CRAWL_FAILURE_COOLDOWN_MINUTES', DEFAULT_FAILURE_COOLDOWN_MINUTES);
  const cacheEnabled = process.env.CRAWL_CACHE_ENABLED === '0' ? false : true;
  const criticalFailureThreshold = parseEnvInt(
    'CRAWL_CRITICAL_FAILURE_THRESHOLD',
    DEFAULT_CRITICAL_FAILURE_THRESHOLD
  );
  const criticalKeywords = resolveCriticalKeywords();
  const cache = cacheEnabled ? loadCache() : {};
  const ttlMs = cacheTtlMinutes * 60 * 1000;
  const failureCooldownMs = failureCooldownMinutes * 60 * 1000;
  const criticalFailures = [];
  const failures = [];
  const circuitOpen = [];
  let cacheHitSources = 0;
  let fetchedSources = 0;

  console.log(`Crawl concurrency: ${concurrency}`);
  console.log(`Crawl cache: ${cacheEnabled ? `enabled (TTL ${cacheTtlMinutes}m)` : 'disabled'}`);
  console.log(`Failure cooldown: ${failureCooldownMinutes}m`);
  console.log(`Critical failure threshold: ${criticalFailureThreshold}`);

  for (let i = 0; i < feeds.length; i += concurrency) {
    const batch = feeds.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((feed) => fetchFeed(feed, cache, ttlMs, cacheEnabled, failureCooldownMs))
    );
    batchResults.forEach((result, index) => {
      const feed = batch[index];
      allItems.push(...(result.items || []));

      if (result.fromCache) {
        cacheHitSources += 1;
      } else if (!result.failed) {
        fetchedSources += 1;
      }

      if (result.skippedByCircuit) {
        circuitOpen.push({
          title: feed.title || feed.name || feed.url,
          url: feed.url,
          reason: result.errorMessage || 'recent failure'
        });
      }

      if (result.failed) {
        failures.push({
          title: feed.title || feed.name || feed.url,
          url: feed.url,
          reason: result.errorMessage || 'unknown error',
          skippedByCircuit: Boolean(result.skippedByCircuit)
        });
      }

      if (result.failed && isCriticalFeed(feed, criticalKeywords)) {
        criticalFailures.push({
          title: feed.title || feed.name || feed.url,
          url: feed.url,
          error: result.errorMessage || 'unknown error'
        });
      }
    });
  }

  if (cacheEnabled) {
    saveCache(cache);
  }

  if (criticalFailures.length >= criticalFailureThreshold) {
    writeStatusJson({
      started_at: startedAt.toISOString(),
      ended_at: new Date().toISOString(),
      duration_ms: Date.now() - startedMs,
      config: {
        concurrency,
        cache_enabled: cacheEnabled,
        cache_ttl_minutes: cacheTtlMinutes,
        failure_cooldown_minutes: failureCooldownMinutes,
        critical_failure_threshold: criticalFailureThreshold,
        critical_sources: criticalKeywords
      },
      summary: {
        total_sources: feeds.length,
        fetched_sources: fetchedSources,
        cache_hit_sources: cacheHitSources,
        failed_sources: failures.length,
        circuit_open_sources: circuitOpen.length,
        critical_failures: criticalFailures.length,
        build_blocked: true
      },
      critical_failures: criticalFailures,
      failures,
      circuit_open: circuitOpen
    });

    console.error('Critical source failure threshold reached.');
    criticalFailures.forEach((failure, idx) => {
      console.error(
        `[${idx + 1}] ${failure.title} (${failure.url}) -> ${failure.error}`
      );
    });
    process.exit(1);
  }

  const deduped = dedupeByTitleAndLink(allItems);
  const recentItems = keepRecentThreeMonths(deduped);
  writeItemsJson(recentItems);

  writeStatusJson({
    started_at: startedAt.toISOString(),
    ended_at: new Date().toISOString(),
    duration_ms: Date.now() - startedMs,
    config: {
      concurrency,
      cache_enabled: cacheEnabled,
      cache_ttl_minutes: cacheTtlMinutes,
      failure_cooldown_minutes: failureCooldownMinutes,
      critical_failure_threshold: criticalFailureThreshold,
      critical_sources: criticalKeywords
    },
    summary: {
      total_sources: feeds.length,
      fetched_sources: fetchedSources,
      cache_hit_sources: cacheHitSources,
      failed_sources: failures.length,
      circuit_open_sources: circuitOpen.length,
      critical_failures: criticalFailures.length,
      total_items_after_dedupe: deduped.length,
      total_items_after_retention: recentItems.length,
      build_blocked: false
    },
    critical_failures: criticalFailures,
    failures,
    circuit_open: circuitOpen
  });
}

if (require.main === module) {
  main();
}
