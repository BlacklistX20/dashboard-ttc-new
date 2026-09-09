const { DataTypes } = require('sequelize');

// Pastikan Anda nanti menambahkan dbControl di file database.js Anda
const { dbControl } = require('../config/database'); 

const DeviceState = dbControl.define('DeviceState', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  device_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  device_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  state: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'device_states',
  timestamps: true,
  createdAt: false, 
  updatedAt: 'updated_at' // Otomatis mengelola kolom updated_at
});

const ControlLog = dbControl.define('ControlLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  device_code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'control_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false // Tabel log hanya mencatat waktu dibuat
});

module.exports = { DeviceState, ControlLog };