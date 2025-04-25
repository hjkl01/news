const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const moment = require('moment');

// 连接到 SQLite 数据库
function connectDb(dbName) {
  return new sqlite3.Database(dbName, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });
}

// 查询当天更新的内容
function queryTodayUpdates(db, callback) {
  const startOfDay = moment().subtract(1, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const endOfDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
  db.all(`
    SELECT * FROM rss_items
    WHERE pub_date BETWEEN ? AND ? order by pub_date desc
  `, [startOfDay, endOfDay], (err, rows) => {
    if (err) {
      console.error(err.message);
      callback([]);
    } else {
      callback(rows);
    }
  });
}

function generate_today() {
  const db = connectDb('rss.db');
  queryTodayUpdates(db, (rows) => {
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
    db.close((err) => {
      if (err) {
        console.error(`Error closing the database: ${err.message}`);
      }
      console.log('Database closed.');
    });
  });
}

function generate_title() {
  // 分类名称映射
  const categoryMap = {
    '新闻': 'news',
    '国外': 'foreign',
    '科技': 'tech',
    '技术': 'code',
    '生活': 'live',
    '资讯': 'info',
    '论坛': 'forum',
    '娱乐': 'funny',
    '公众号': 'public'
  };
  const db = connectDb('rss.db');

  // 查询所有数据
  db.all('SELECT * FROM rss_items order by pub_date desc', [], (err, rows) => {
    if (err) {
      console.error('Failed to fetch data from the database:', err.message);
      return;
    }

    // 按分类组织数据
    const categorizedData = {};
    rows.forEach(row => {
      const categoryKey = categoryMap[row.category] || 'uncategorized';
      if (!categorizedData[categoryKey]) {
        categorizedData[categoryKey] = [];
      }
      categorizedData[categoryKey].push(row);
    });

    // 将数据写入相应的文件夹
    for (const [category, data] of Object.entries(categorizedData)) {
      const folderPath = path.join(__dirname, `src/app/${category}`);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      const filePath = path.join(folderPath, 'data.json');
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Data for category ${category} has been written to ${filePath}`);
    }

    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('Failed to close the database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
}

// 主函数
function main() {
  generate_today();
  generate_title();
}

if (require.main === module) {
  main();
}
