'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      File.belongsTo(models.Book, {
        foreignKey: 'owner_uuid',
        as: 'book'
      })
      // define association here
    }
  }
  File.init({
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    file_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_size: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    original_filename: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    owner_uuid: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'File',
    createdAt: true
  });
  return File;
};