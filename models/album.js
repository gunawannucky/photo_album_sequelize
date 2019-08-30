'use strict';

module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.Sequelize.Model
  class Album extends Model {
    static findPublicAlbum () {
      return Album.findAll({
        where : {
          isPrivate : false
        },
        include: [{
          model: sequelize.models.Contributor,
          as: 'Contributors'
        }]
      })
    }

    static findPrivateAlbum(UserId) {
      return Album.findAll({
        where: {
          isPrivate: true
        },
        include : [
          {
            model : sequelize.models.Contributor,
            as : 'Contributors',
            where : {
              UserId : UserId
            },
            required : true
          }
        ]
      })
    }

    static findPhotos(AlbumId) {
      return sequelize.models.Contributor.findAll({
        where: {
          AlbumId: AlbumId
        },
        include: [{
          model: sequelize.models.Photo,
          as: 'Photos'
        }, {
          model: sequelize.models.Album,
          as: 'Album'
        }]
      })
    }

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