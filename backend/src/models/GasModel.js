const { DataTypes } = require('sequelize');
const { dbGas } = require('../config/database'); // <-- Baris ini yang memanggil dbGas

// 1. Model Data Realtime (per_second)
const PerSecond = dbGas.define('PerSecond', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gas: { type: DataTypes.STRING(50), allowNull: false },
  room: { type: DataTypes.STRING(50), allowNull: false },
  temp1: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  hum1: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  temp2: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  hum2: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  sensor1: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  sensor2: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  sensor3: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 }
}, {
  tableName: 'per_second',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

// 2. Model Riwayat Ruangan (Histori)
const historySchema = {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  temp1: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  hum1: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  temp2: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  hum2: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  sensor1: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
  sensor2: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 }
};

const historyConfig = (tableName) => ({
  tableName, timestamps: true, createdAt: false, updatedAt: 'updated_at'
});

const VendorHistory = dbGas.define('VendorHistory', historySchema, historyConfig('vendor'));
const ControlHistory = dbGas.define('ControlHistory', historySchema, historyConfig('control'));
const Battery2History = dbGas.define('Battery2History', historySchema, historyConfig('battery2'));
const Battery3History = dbGas.define('Battery3History', historySchema, historyConfig('battery3'));
const Battery4History = dbGas.define('Battery4History', historySchema, historyConfig('battery4'));

// 3. Model Alerts
const Alert = dbGas.define('Alert', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  gas: { type: DataTypes.STRING(50), allowNull: false },
  room: { type: DataTypes.STRING(50), allowNull: false },
  alert: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING(50), allowNull: false }
}, {
  tableName: 'alerts',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

module.exports = { 
  PerSecond, 
  VendorHistory, 
  ControlHistory, 
  Battery2History, 
  Battery3History, 
  Battery4History, 
  Alert 
};