const { DataTypes } = require('sequelize');
const { dbPower } = require('../config/database');

// =========================================================================
// 1. FORMAT STANDAR UNTUK 15 TABEL (Struktur Kolom yang Sama)
// =========================================================================
const standardAttributes = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  loads: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  voltage: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  current: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  frequency: { type: DataTypes.DECIMAL(15, 2), allowNull: false }
};

const standardOptions = (tableName) => ({
  tableName: tableName,
  timestamps: true, 
  createdAt: false, 
  updatedAt: 'updated_at' // Memetakan otomatis ke kolom 'updated_at' di SQL Anda
});

// Mendefinisikan ke-15 tabel standar sekaligus
const It = dbPower.define('It', standardAttributes, standardOptions('it'));
const Lvmdp = dbPower.define('Lvmdp', standardAttributes, standardOptions('lvmdp'));
const P205 = dbPower.define('P205', standardAttributes, standardOptions('p205'));
const P236 = dbPower.define('P236', standardAttributes, standardOptions('p236'));
const P305 = dbPower.define('P305', standardAttributes, standardOptions('p305'));
const P310 = dbPower.define('P310', standardAttributes, standardOptions('p310'));
const P429 = dbPower.define('P429', standardAttributes, standardOptions('p429'));
const Recti = dbPower.define('Recti', standardAttributes, standardOptions('recti'));
const Ups = dbPower.define('Ups', standardAttributes, standardOptions('ups'));
const Ups202 = dbPower.define('Ups202', standardAttributes, standardOptions('ups202'));
const Ups203 = dbPower.define('Ups203', standardAttributes, standardOptions('ups203'));
const Ups301 = dbPower.define('Ups301', standardAttributes, standardOptions('ups301'));
const Ups302 = dbPower.define('Ups302', standardAttributes, standardOptions('ups302'));
const Ups501 = dbPower.define('Ups501', standardAttributes, standardOptions('ups501'));
const Ups502 = dbPower.define('Ups502', standardAttributes, standardOptions('ups502'));


// =========================================================================
// 2. MODEL KHUSUS: TABEL 'per_second' (Memiliki struktur berbeda)
// =========================================================================
const PerSecond = dbPower.define('PerSecond', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false },
  loads: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  current: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  voltage: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  frequency: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  status: { type: DataTypes.STRING(1), allowNull: false }
}, {
  tableName: 'per_second',
  timestamps: true,
  createdAt: false,
  updatedAt: 'last_update' // Kolomnya bernama 'last_update', bukan 'updated_at'
});


// =========================================================================
// 3. MODEL KHUSUS: TABEL 'pue' (Berisi banyak kolom komparasi)
// =========================================================================
const Pue = dbPower.define('Pue', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pue: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  pue2: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  lvmdp: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  it: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  it2: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  facility: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  recti: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  recti2: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ups: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ups2: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  p205: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  p236: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  p305: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  p310: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  p429: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ups202: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ups203: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ups301: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ups302: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ups501: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ups502: { type: DataTypes.DECIMAL(15, 2), allowNull: false }
}, {
  tableName: 'pue',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

// =========================================================================
// EXPORT SEMUA MODEL UNTUK DIGUNAKAN DI CONTROLLER
// =========================================================================
module.exports = {
  It, Lvmdp, P205, P236, P305, P310, P429, 
  Recti, Ups, Ups202, Ups203, Ups301, Ups302, Ups501, Ups502,
  PerSecond, Pue
};