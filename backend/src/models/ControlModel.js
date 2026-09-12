const { DataTypes } = require('sequelize');
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

const PacSetting = dbControl.define('PacSetting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
  temp_mode: { type: DataTypes.TINYINT, defaultValue: 1 },
  temp_min: { type: DataTypes.INTEGER, defaultValue: 18 },
  temp_max: { type: DataTypes.INTEGER, defaultValue: 24 },
  time_mode: { type: DataTypes.TINYINT, defaultValue: 0 },
  time_on: { type: DataTypes.STRING(5), defaultValue: '08:00' },
  time_off: { type: DataTypes.STRING(5), defaultValue: '17:00' }
}, {
  tableName: 'pac_settings',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

module.exports = { DeviceState, ControlLog, PacSetting };