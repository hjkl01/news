const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

function connectDb(dbName) {
  const db = new Database(dbName);
  console.log('Connected to the database.');
  return db;
}

function queryTodayUpdates(db) {
  const startOfDay = moment().subtract(1, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const endOfDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
  console.log(`Querying updates from ${startOfDay} to ${endOfDay}`);
  try {
    return db.prepare(`
      SELECT * FROM rss_items
      WHERE pub_date BETWEEN ? AND ? order by pub_date desc
    `).all(startOfDay, endOfDay);
  } catch (err) {
    console.error(err.message);
    return [];
  }
}

function generate_today() {
  const db = connectDb('rss.db');
  try {
    const rows = queryTodayUpdates(db);
    const todayUpdates = rows.map(row => ({
      id: row.id,
      feed_name: row.feed_name,
      category: row.category,
      title: row.title,
      link: row.link,
      pub_date: row.pub_date
    })).filter(update => !update.link.includes('66y')).filter(update => !update.link.includes('weibo')).filter(update => !update.category.includes('论坛')).filter(update => !update.feed_name.includes('github')).filter(update => !update.category.includes('财经'));

    fs.writeFileSync('src/app/data.json', JSON.stringify(todayUpdates, null, 2));
    console.log('Today updates saved');
  } finally {
    db.close();
    console.log('Database closed.');
  }
}

function generate_title() {
  const categoryMap = {
    '新闻': 'news',
    '国外': 'foreign',
    '科技': 'tech',
    '技术': 'code',
    '论坛': 'forum',
    '娱乐': 'funny',
  };
  const db = connectDb('rss.db');
  const categories = Object.keys(categoryMap);

  categories.forEach((cat) => {
    const categoryKey = categoryMap[cat];
    const feeds = db.prepare(`SELECT DISTINCT feed_name FROM rss_items WHERE category = ?`).all(cat);

    if (feeds.length === 0) {
      const folderPath = path.join(__dirname, `src/app/${categoryKey}`);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      const filePath = path.join(folderPath, 'data.json');
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return;
    }

    let allRows = [];
    feeds.forEach(feed => {
      const rows = db.prepare(`SELECT * FROM rss_items WHERE category = ? AND feed_name = ? ORDER BY pub_date DESC LIMIT 20`).all(cat, feed.feed_name);
      if (rows && rows.length > 0) {
        allRows = allRows.concat(rows);
      }
    });

    const folderPath = path.join(__dirname, `src/app/${categoryKey}`);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(folderPath, 'data.json');
    fs.writeFileSync(filePath, JSON.stringify(allRows, null, 2));
    console.log(`Data for category ${categoryKey} has been written to ${filePath}`);
  });

  db.close();
  console.log('Database closed.');
}

function main() {
  generate_today();
  generate_title();
}

if (require.main === module) {
  main();
}
