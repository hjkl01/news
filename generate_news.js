const fs = require('fs');
const path = require('path');

function readItems() {
  const filePath = path.join(__dirname, 'public', 'rss-items.json');
  if (!fs.existsSync(filePath)) {
    console.warn(`No data file found: ${filePath}`);
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJson(relativePath, data) {
  const filePath = path.join(__dirname, relativePath);
  const folderPath = path.dirname(filePath);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Wrote ${data.length} records to ${relativePath}`);
}

function writeDataModule(relativePath, data) {
  const filePath = path.join(__dirname, relativePath);
  const folderPath = path.dirname(filePath);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const moduleContent = `const jsonData = ${JSON.stringify(data, null, 2)};\n\nexport default jsonData;\n`;
  fs.writeFileSync(filePath, moduleContent);
  console.log(`Wrote ${data.length} records to ${relativePath}`);
}

function removeIfExists(relativePath) {
  const filePath = path.join(__dirname, relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Removed legacy file ${relativePath}`);
  }
}

function sortByLatest(items) {
  return [...items].sort((a, b) => {
    const ta = new Date(a.pub_date).getTime();
    const tb = new Date(b.pub_date).getTime();
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });
}

function normalizeText(text, maxLength = 220) {
  if (!text) return '';
  const compact = String(text).replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength)}…`;
}

function shrinkItem(item) {
  return {
    id: item.id,
    feed_name: item.feed_name,
    category: item.category,
    title: normalizeText(item.title, 180),
    link: item.link,
    pub_date: item.pub_date,
    author: item.author || '',
    description: normalizeText(item.description, 220),
    content: normalizeText(item.content, 260)
  };
}

function filterNoise(items) {
  return items
    .filter((item) => !String(item.link || '').includes('66y'))
    .filter((item) => !String(item.link || '').includes('weibo'))
    .filter((item) => !String(item.category || '').includes('财经'))
    .filter((item) => !String(item.feed_name || '').toLowerCase().includes('github'));
}

const PAGE_LIMITS = {
  home: 220,
  新闻: 180,
  国外: 140,
  科技: 160,
  技术: 140,
  论坛: 140,
  娱乐: 120
};

function generateToday(items) {
  const recent = sortByLatest(filterNoise(items))
    .slice(0, PAGE_LIMITS.home)
    .map(shrinkItem);
  writeDataModule('src/app/data.js', recent);
}

function generateCategoryData(items) {
  const categoryMap = {
    新闻: 'news',
    国外: 'foreign',
    科技: 'tech',
    技术: 'code',
    论坛: 'forum',
    娱乐: 'funny'
  };

  Object.entries(categoryMap).forEach(([categoryName, folder]) => {
    const rows = sortByLatest(
      items.filter((item) => String(item.category || '') === categoryName)
    )
      .slice(0, PAGE_LIMITS[categoryName] || 120)
      .map(shrinkItem);

    writeDataModule(`src/app/${folder}/data.js`, rows);
  });
}

function cleanupLegacyDataJson() {
  removeIfExists('src/app/data.json');

  ['news', 'foreign', 'tech', 'code', 'forum', 'funny'].forEach((folder) => {
    removeIfExists(`src/app/${folder}/data.json`);
  });
}

function main() {
  const items = readItems();
  generateToday(items);
  generateCategoryData(items);
  cleanupLegacyDataJson();
}

if (require.main === module) {
  main();
}
