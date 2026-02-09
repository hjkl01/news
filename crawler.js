const fs = require('fs');
const Database = require('better-sqlite3');
const Parser = require('rss-parser');
const moment = require('moment');

function readFeeds(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function connectDb(dbName) {
  const db = new Database(dbName);
  console.log('Connected to the database.');

  db.pragma('journal_mode = WAL');

  db.prepare(`
    CREATE TABLE IF NOT EXISTS rss_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_name TEXT NOT NULL,
      feed_url TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      link TEXT NOT NULL,
      pub_date TEXT,
      author TEXT,
      UNIQUE(title, link)
    )
  `).run();
  console.log('Table created.');

  return db;
}

const insertStmt = {};
function insertItems(db, items) {
  if (!insertStmt[db.name]) {
    insertStmt[db.name] = db.prepare('INSERT OR IGNORE INTO rss_items (feed_name, feed_url, category, title, link, pub_date, author) VALUES (?, ?, ?, ?, ?, ?, ?)');
  }
  const stmt = insertStmt[db.name];
  const insert = db.transaction((items) => {
    for (const item of items) {
      stmt.run(item.feed_name, item.feed_url, item.category, item.title, item.link, item.pub_date, item.author);
    }
  });
  insert(items);
}

async function fetchAndSaveRss(feed, db) {
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
      feed_name: feed.title || feed.name,
      feed_url: feed.url,
      category: feed.category,
      title: item.title,
      link: item.link,
      pub_date: moment(item.pubDate).format('YYYY-MM-DD HH:mm:ss'),
      author: item.author
    }));
    console.log(`Fetched ${items.length} items from ${feed.url}`);
    insertItems(db, items);
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.error(`Timeout fetching ${feed.url}`);
    } else if (err.message === 'Feed not recognized as RSS 1 or 2.') {
      console.warn(`Invalid RSS feed: ${feed.url}`);
    } else {
      console.error(`Error fetching ${feed.url}: ${err.message}`);
    }
  }
}

function deleteOldRecords(db) {
  const threeMonthsAgo = moment().subtract(3, 'months').format('YYYY-MM-DD HH:mm:ss');
  db.prepare(`DELETE FROM rss_items WHERE pub_date < ?`).run(threeMonthsAgo);
}

async function main() {
  const feedsData = readFeeds('./public/rss-feeds.json');
  const feeds = feedsData.feeds;
  const db = connectDb('rss.db');

  for (const feed of feeds) {
    await fetchAndSaveRss(feed, db);
  }

  deleteOldRecords(db);

  db.close();
  console.log('Database closed.');
}

if (require.main === module) {
  main();
}
