const { DataTypes } = require('sequelize');
const { dbPotency } = require('../config/database');

const standardOptions = (tableName) => ({
  tableName: tableName,
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

// =========================================================================
// 1. TABEL IDENTIK TANPA PK DI SQL (Di-inject Primary Key oleh Sequelize)
// Tabel: finishing, safety, transport
// =========================================================================
const commonAttributes = {
  id: { type: DataTypes.INTEGER(4).UNSIGNED.ZEROFILL, primaryKey: true, autoIncrement: true }, // PK Injected
  ne_id: { type: DataTypes.STRING(30), allowNull: false },
  floor: { type: DataTypes.STRING(2), allowNull: false },
  room: { type: DataTypes.STRING(7), allowNull: false },
  category: { type: DataTypes.STRING(10), allowNull: false },
  name: { type: DataTypes.STRING(20), allowNull: false },
  vendor: { type: DataTypes.STRING(50), allowNull: false },
  brand: { type: DataTypes.STRING(50), allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  kondisi: { type: DataTypes.STRING(10), allowNull: false },
  ket: { type: DataTypes.STRING(500), allowNull: false },
  install: { type: DataTypes.DATEONLY, allowNull: false },
  maintanance: { type: DataTypes.STRING(11), defaultValue: '-' }
};

const Finishing = dbPotency.define('Finishing', commonAttributes, standardOptions('finishing'));
const Safety = dbPotency.define('Safety', commonAttributes, standardOptions('safety'));
const Transport = dbPotency.define('Transport', commonAttributes, standardOptions('transport'));

// =========================================================================
// 2. TABEL FURNITURE (Tanpa PK, tanpa ne_id)
// =========================================================================
const Furniture = dbPotency.define('Furniture', {
  id: { type: DataTypes.INTEGER(4).UNSIGNED.ZEROFILL, primaryKey: true, autoIncrement: true }, // PK Injected
  floor: { type: DataTypes.STRING(2), allowNull: false },
  room: { type: DataTypes.STRING(7), allowNull: false },
  category: { type: DataTypes.STRING(10), allowNull: false },
  name: { type: DataTypes.STRING(20), allowNull: false },
  vendor: { type: DataTypes.STRING(50), allowNull: false },
  brand: { type: DataTypes.STRING(50), allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  kondisi: { type: DataTypes.STRING(10), allowNull: false },
  ket: { type: DataTypes.STRING(500), allowNull: false },
  install: { type: DataTypes.DATEONLY, allowNull: false },
  maintanance: { type: DataTypes.STRING(11), defaultValue: '-' }
}, standardOptions('furniture'));

// =========================================================================
// 3. TABEL KHUSUS LAINNYA
// =========================================================================

const Cool = dbPotency.define('Cool', {
  id: { type: DataTypes.SMALLINT(5).UNSIGNED.ZEROFILL, primaryKey: true, autoIncrement: true },
  barcode: { type: DataTypes.STRING(20), allowNull: false },
  floor: { type: DataTypes.STRING(15), allowNull: false },
  room: { type: DataTypes.STRING(25), allowNull: false },
  category: { type: DataTypes.STRING(11), allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  vendor: { type: DataTypes.STRING(20), allowNull: false },
  brand: { type: DataTypes.STRING(20), allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  compressor: { type: DataTypes.STRING(6), allowNull: false },
  flow: { type: DataTypes.STRING(5), allowNull: false },
  capacity: { type: DataTypes.DOUBLE(15, 2), allowNull: false },
  condition: { type: DataTypes.STRING(5), allowNull: false },
  status: { type: DataTypes.STRING(3), allowNull: false },
  aging: { type: DataTypes.STRING(15), allowNull: false },
  info: { type: DataTypes.STRING(500), allowNull: false },
  install: { type: DataTypes.STRING(11), allowNull: false },
  maintanance: { type: DataTypes.STRING(11), allowNull: false }
}, standardOptions('cool'));

const Fire = dbPotency.define('Fire', {
  id: { type: DataTypes.SMALLINT(5).UNSIGNED.ZEROFILL, primaryKey: true, autoIncrement: true },
  floor: { type: DataTypes.STRING(15), allowNull: false },
  room: { type: DataTypes.STRING(25), allowNull: false },
  category: { type: DataTypes.STRING(10), allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  vendor: { type: DataTypes.STRING(50), allowNull: false },
  brand: { type: DataTypes.STRING(50), allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  barcode: { type: DataTypes.STRING(30), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  condition: { type: DataTypes.STRING(10), allowNull: false },
  info: { type: DataTypes.STRING(500), allowNull: false },
  install: { type: DataTypes.INTEGER(4), allowNull: false }, // Year mapping
  maintanance: { type: DataTypes.STRING(11), defaultValue: '-' }
}, standardOptions('fire'));

const Light = dbPotency.define('Light', {
  id: { type: DataTypes.SMALLINT(5).UNSIGNED.ZEROFILL, primaryKey: true, autoIncrement: true },
  floor: { type: DataTypes.STRING(15), allowNull: false },
  room: { type: DataTypes.STRING(30), allowNull: false },
  brand: { type: DataTypes.STRING(50), allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  watt: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  condition: { type: DataTypes.STRING(10), allowNull: false },
  info: { type: DataTypes.STRING(500), allowNull: false }
}, standardOptions('light'));

const PowerAsset = dbPotency.define('PowerAsset', { // Dinamakan PowerAsset agar tidak bentrok dgn nama DB Power
  id: { type: DataTypes.SMALLINT(5).UNSIGNED.ZEROFILL, primaryKey: true, autoIncrement: true },
  sn: { type: DataTypes.STRING(50), allowNull: false },
  barcode: { type: DataTypes.STRING(20), allowNull: false },
  floor: { type: DataTypes.STRING(15), allowNull: false },
  room: { type: DataTypes.STRING(25), allowNull: false },
  category: { type: DataTypes.STRING(10), allowNull: false },
  name: { type: DataTypes.STRING(500), allowNull: false },
  vendor: { type: DataTypes.STRING(50), allowNull: false },
  brand: { type: DataTypes.STRING(50), allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  modul: { type: DataTypes.INTEGER, allowNull: false },
  modul_capacity: { type: DataTypes.DOUBLE(15, 2), allowNull: false },
  occupancy: { type: DataTypes.INTEGER, allowNull: false },
  aging: { type: DataTypes.STRING(15), allowNull: false },
  battery: { type: DataTypes.STRING(50), allowNull: false },
  battery_qty: { type: DataTypes.INTEGER, allowNull: false },
  source_a: { type: DataTypes.STRING(30), allowNull: false },
  source_b: { type: DataTypes.STRING(30), allowNull: false },
  condition: { type: DataTypes.STRING(5), allowNull: false },
  status: { type: DataTypes.STRING(3), allowNull: false },
  info: { type: DataTypes.STRING(500), allowNull: false },
  install: { type: DataTypes.STRING(11), allowNull: false },
  maintanance: { type: DataTypes.STRING(11), defaultValue: '-' }
}, standardOptions('power'));

const Pump = dbPotency.define('Pump', {
  id: { type: DataTypes.SMALLINT(5).UNSIGNED.ZEROFILL, primaryKey: true, autoIncrement: true },
  floor: { type: DataTypes.STRING(15), allowNull: false },
  room: { type: DataTypes.STRING(25), allowNull: false },
  name: { type: DataTypes.STRING(50), allowNull: false },
  vendor: { type: DataTypes.STRING(50), allowNull: false },
  brand: { type: DataTypes.STRING(50), allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  condition: { type: DataTypes.STRING(10), allowNull: false },
  info: { type: DataTypes.STRING(500), allowNull: false },
  install: { type: DataTypes.STRING(4), allowNull: false }
}, standardOptions('pump'));

const Rack = dbPotency.define('Rack', {
  id: { type: DataTypes.SMALLINT(5).UNSIGNED.ZEROFILL, primaryKey: true, autoIncrement: true },
  barcode: { type: DataTypes.STRING(30), allowNull: false },
  floor: { type: DataTypes.STRING(15), allowNull: false },
  room: { type: DataTypes.STRING(25), allowNull: false },
  category: { type: DataTypes.STRING(10), allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false },
  source_a: { type: DataTypes.STRING(50), allowNull: false },
  source_b: { type: DataTypes.STRING(50), allowNull: false },
  status: { type: DataTypes.STRING(3), allowNull: false },
  info: { type: DataTypes.STRING(500), allowNull: false }
}, standardOptions('rack'));

const Security = dbPotency.define('Security', {
  id: { type: DataTypes.SMALLINT(5).UNSIGNED.ZEROFILL, primaryKey: true, autoIncrement: true },
  floor: { type: DataTypes.STRING(15), allowNull: false },
  room: { type: DataTypes.STRING(25), allowNull: false },
  vendor: { type: DataTypes.STRING(50), allowNull: false },
  brand: { type: DataTypes.STRING(50), allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  condition: { type: DataTypes.STRING(10), allowNull: false },
  status: { type: DataTypes.STRING(3), allowNull: false },
  info: { type: DataTypes.STRING(500), allowNull: false },
  install: { type: DataTypes.INTEGER(4), allowNull: false },
  maintanance: { type: DataTypes.STRING(11), defaultValue: '-' }
}, standardOptions('security'));

const Tank = dbPotency.define('Tank', {
  id: { type: DataTypes.SMALLINT(5).UNSIGNED.ZEROFILL, primaryKey: true, autoIncrement: true },
  floor: { type: DataTypes.STRING(15), allowNull: false },
  room: { type: DataTypes.STRING(25), allowNull: false },
  name: { type: DataTypes.STRING(20), allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  refil: { type: DataTypes.DATEONLY, allowNull: false },
  condition: { type: DataTypes.STRING(10), allowNull: false },
  info: { type: DataTypes.STRING(500), allowNull: false }
}, standardOptions('tank'));

module.exports = {
  Finishing, Safety, Transport, Furniture, Cool, Fire, Light, PowerAsset, Pump, Rack, Security, Tank
};