'use strict';
module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.Sequelize.Model
  class Photo extends Model {

  }
  Photo.init({
    filename: DataTypes.STRING,
    ContributorId: DataTypes.INTEGER
  }, {
    sequelize
  });
  Photo.associate = function(models) {
    // associations can be defined here
  };
  return Photo;
};