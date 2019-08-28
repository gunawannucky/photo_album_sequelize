'use strict';
module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.Sequelize.Model
  class Contributor extends Model {

  }
  Contributor.init({
    UserId: DataTypes.INTEGER,
    AlbumId: DataTypes.INTEGER
  }, {
    sequelize
  });
  Contributor.associate = function(models) {
    // associations can be defined here
    Contributor.belongsTo(models.User, { as: 'User', foreignKey: 'UserId', targetKey: 'id' })
    Contributor.belongsTo(models.Album, { as: 'Album', foreignKey: 'AlbumId', targetKey: 'id' })
  };
  return Contributor;
};