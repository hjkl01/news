const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const Parser = require('rss-parser');
const async = require('async');
const moment = require('moment');

// 读取 feeds.json 文件
function readFeeds(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// 连接到 SQLite 数据库
function connectDb(dbName) {
  const db = new sqlite3.Database(dbName, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });

  // 开启 WAL 模式提升并发写入性能
  db.run('PRAGMA journal_mode = WAL');

  db.run(`
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
  `, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Table created.');
  });

  return db;
}

// 批量插入数据到数据库，重用 statement，串行写入
function insertItems(db, items, callback) {
  const stmt = db.prepare('INSERT OR IGNORE INTO rss_items (feed_name, feed_url, category, title, link, pub_date, author) VALUES (?, ?, ?, ?, ?, ?, ?)');
  async.eachSeries(items, (item, cb) => {
    stmt.run(
      item.feed_name,
      item.feed_url,
      item.category,
      item.title,
      item.link,
      item.pub_date,
      item.author,
      cb
    );
  }, (err) => {
    stmt.finalize();
    callback(err);
  });
}

// 抓取并保存单个 RSS 地址的数据
async function fetchAndSaveRss(feed, db, callback) {
  const parser = new Parser();
  const { default: fetch } = await import('node-fetch');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(feed.url, { signal: controller.signal });
    const xml = await res.text();
    clearTimeout(timeout);
    const parsedFeed = await parser.parseString(xml);
    const items = (parsedFeed.items || []).map(item => ({
      feed_name: feed.title || feed.name, // 支持 title 和 name 字段
      feed_url: feed.url,
      category: feed.category,
      title: item.title,
      link: item.link,
      pub_date: moment(item.pubDate).format('YYYY-MM-DD HH:mm:ss'),
      author: item.author
    }));
    console.log(`Fetched ${items.length} items from ${feed.url}`);
    insertItems(db, items, (err) => {
      if (err) {
        console.error(`Error inserting items from ${feed.url}: ${err.message}`);
      }
      callback(null);
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.error(`Timeout fetching ${feed.url}`);
    } else {
      console.error(`Error fetching ${feed.url}: ${err.message}`);
    }
    callback(err); // 让 async.each 能感知错误
  }
}

// 删除3个月前的数据
function deleteOldRecords(db, callback) {
  const threeMonthsAgo = moment().subtract(3, 'months').format('YYYY-MM-DD HH:mm:ss');
  db.run(`DELETE FROM rss_items WHERE pub_date < ?`, [threeMonthsAgo], (err) => {
    if (err) {
      console.error(`Error deleting old records: ${err.message}`);
    }
    callback && callback();
  });
}

// 主函数
async function main() {
  const feedsData = readFeeds('./public/rss-feeds.json');
  const feeds = feedsData.feeds; // 获取feeds数组
  const db = connectDb('rss.db');

  // 用 Promise.all 等待所有抓取和插入完成
  await Promise.all(feeds.map(feed => {
    return new Promise(resolve => {
      fetchAndSaveRss(feed, db, () => resolve());
    });
  }));

  // 删除旧数据
  await new Promise(resolve => {
    deleteOldRecords(db, resolve);
  });

  // 关闭数据库
  db.close((err) => {
    if (err) {
      console.error(`Error closing the database: ${err.message}`);
    }
    console.log('Database closed.');
    // process.exit(0);
  });
}

if (require.main === module) {
  main();
}
