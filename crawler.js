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
function fetchAndSaveRss(feed, db, callback) {
  let parser = new Parser({
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
      'Accept-Encoding': 'none',
      'Accept-Language': 'en-US,en;q=0.8',
      'Connection': 'keep-alive',
    },
  });
  parser.parseURL(feed.url, (err, parsedFeed) => {
    if (err) {
      console.error(`Error fetching ${feed.url}: ${err.message}`);
      callback(null);
      return;
    }
    const items = (parsedFeed.items || []).map(item => ({
      feed_name: feed.title,
      feed_url: feed.url,
      category: feed.category,
      title: item.title,
      link: item.link,
      pub_date: moment(item.pubDate).format('YYYY-MM-DD HH:mm:ss'),
      author: item.author
    }));
    insertItems(db, items, (err) => {
      if (err) {
        console.error(`Error inserting items from ${feed.url}: ${err.message}`);
      }
      callback(null);
    });
  });
}

// 删除3个月前的数据
function deleteOldRecords(db) {
  const threeMonthsAgo = moment().subtract(3, 'months').format('YYYY-MM-DD HH:mm:ss');
  db.run(`DELETE FROM rss_items WHERE pub_date < ?`, [threeMonthsAgo], (err) => {
    if (err) {
      console.error(`Error deleting old records: ${err.message}`);
    }
  });
}


// 主函数
function main() {
  const feeds = readFeeds('./feeds.json');
  const db = connectDb('rss.db');

  async.each(feeds, (feed, callback) => {
    fetchAndSaveRss(feed, db, callback);
  }, (err) => {
    if (err) {
      console.error(`Error processing feeds: ${err.message}`);
    }
    db.close((err) => {
      if (err) {
        console.error(`Error closing the database: ${err.message}`);
      }
      console.log('Database closed.');
    });
  });

  deleteOldRecords(db);
}

if (require.main === module) {
  main();
}
