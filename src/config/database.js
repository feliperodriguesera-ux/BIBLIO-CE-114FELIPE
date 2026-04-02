const mysql = require("mysql2/promise");

// Esta configuracao centraliza a conexao com o MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "senai2025",
  database: process.env.DB_NAME || "Papelaria",
});

module.exports = pool;
