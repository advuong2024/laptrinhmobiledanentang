const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123Aa@',
  database: 'banhang'
});

module.exports = db;
