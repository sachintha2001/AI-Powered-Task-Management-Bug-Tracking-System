const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

pool.getConnection()
    .then(() => console.log('MySQL Connected!'))
    .catch((err) => console.log('MySQL Connection Error:', err));

module.exports = pool;