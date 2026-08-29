const { DataTypes } = require('sequelize');
const { dbGas } = require('../config/database');

const Co2Data = dbGas.define('Co2Data', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  tipe: { 
    type: DataTypes.ENUM('live', 'history'), 
    allowNull: false,
    defaultValue: 'history' 
  },
  co2_ppm: { 
    type: DataTypes.FLOAT, 
    allowNull: false 
  },
  suhu: { 
    type: DataTypes.FLOAT, 
    allowNull: false 
  },
  kelembaban: { 
    type: DataTypes.FLOAT, 
    allowNull: false 
  },
  recorded_at: { 
    type: DataTypes.DATE, 
    allowNull: false 
  }
}, {
  tableName: 'co2_data',
  timestamps: false, // Dimatikan karena tabel ini menggunakan 'recorded_at' spesifik, bukan standar createdAt/updatedAt
  indexes: [
    { fields: ['tipe'] },
    { fields: ['recorded_at'] }
  ]
});

module.exports = {
  Co2Data
};