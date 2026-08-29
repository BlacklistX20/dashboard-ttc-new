const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false, // Matikan log SQL di terminal agar rapi
};

// Inisialisasi 4 Koneksi Terpisah
const dbFuel = new Sequelize('fuel', process.env.DB_USER, process.env.DB_PASS, dbConfig);
const dbPotency = new Sequelize('potency', process.env.DB_USER, process.env.DB_PASS, dbConfig);
const dbPower = new Sequelize('power', process.env.DB_USER, process.env.DB_PASS, dbConfig);
const dbTemp = new Sequelize('temp', process.env.DB_USER, process.env.DB_PASS, dbConfig);
const dbGas = new Sequelize('gas', process.env.DB_USER, process.env.DB_PASS, dbConfig);

module.exports = { dbFuel, dbPotency, dbPower, dbTemp, dbGas }; // Jangan lupa di-export