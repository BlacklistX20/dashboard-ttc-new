const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  pool: {
      max: 30,         // Tingkatkan batas maksimal koneksi (default 5)
      min: 0,          // Minimal koneksi yang dipertahankan
      acquire: 60000,  // Waktu tunggu antrean hingga 60 detik (60000 milidetik)
      idle: 10000      // Putus koneksi jika menganggur lebih dari 10 detik
  },
  logging: false, // Matikan log SQL di terminal agar rapi
};

// Inisialisasi 4 Koneksi Terpisah
const dbFuel = new Sequelize('fuel', process.env.DB_USER, process.env.DB_PASS, dbConfig);
const dbPotency = new Sequelize('potency', process.env.DB_USER, process.env.DB_PASS, dbConfig);
const dbPower = new Sequelize('power', process.env.DB_USER, process.env.DB_PASS, dbConfig);
const dbTemp = new Sequelize('temp', process.env.DB_USER, process.env.DB_PASS, dbConfig);
const dbGas = new Sequelize('gas', process.env.DB_USER, process.env.DB_PASS, dbConfig);
const dbControl = new Sequelize('control', process.env.DB_USER, process.env.DB_PASS, dbConfig);

module.exports = { dbFuel, dbPotency, dbPower, dbTemp, dbGas, dbControl }; // Jangan lupa di-export