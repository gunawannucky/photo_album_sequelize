'use strict';
module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.Sequelize.Model
  class Photo extends Model {

  }
  Photo.init({
    filename: DataTypes.BLOB,
    ContributorId: DataTypes.INTEGER
  }, {
    sequelize
  });
  Photo.associate = function(models) {
    // associations can be defined here
    Photo.belongsTo(models.Contributor, {
      as: 'Contributor',
      foreignKey: 'ContributorId',
      targetKey: 'id'
    })
  };
  return Photo;
};