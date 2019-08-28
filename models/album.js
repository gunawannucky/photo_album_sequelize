'use strict';
module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.Sequelize.Model
  class Album extends Model {

  }
  Album.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    isPrivate: DataTypes.BOOLEAN,
    AdminId: DataTypes.INTEGER
  }, {
    sequelize
  });
  Album.associate = function(models) {
    // associations can be defined here
    Album.belongsTo(models.User, { as: 'Admin', foreignKey: 'AdminId', targetKey: 'id' })
    Album.hasMany(models.Contributor, { as: 'Contributors', foreignKey: 'AlbumId', sourceKey: 'id' })
  };
  return Album;
};