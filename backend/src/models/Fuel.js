const { DataTypes } = require('sequelize');
const { dbFuel } = require('../config/database');

// =========================================================================
// 1. MODEL TANGKI HARIAN (2 Tangki)
// =========================================================================
const Daily = dbFuel.define('Daily', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  tank1: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },
  tank2: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },
  status: { 
    type: DataTypes.STRING(1), 
    allowNull: false 
  }
}, {
  tableName: 'daily',
  timestamps: true,
  createdAt: false, // SQL bawaan tidak memiliki kolom created_at
  updatedAt: 'updated_at' // Memetakan otomatis ke kolom updated_at di SQL
});

// =========================================================================
// 2. MODEL TANGKI BULANAN (3 Tangki)
// =========================================================================
const Monthly = dbFuel.define('Monthly', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  tank1: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },
  tank2: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },
  tank3: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },
  status: { 
    type: DataTypes.STRING(1), 
    allowNull: false 
  }
}, {
  tableName: 'monthly',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

// =========================================================================
// EXPORT MODEL
// =========================================================================
module.exports = {
  Daily,
  Monthly
};