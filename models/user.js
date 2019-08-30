'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.Sequelize.Model
  class User extends Model {
    validPassword (password) {
      return bcrypt.compareSync(password, this.password)
    }
  }

  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
      hooks: {
        // beforeCreate: (user) => {
        //   const crypto = require('crypto')
        //   const salt = 'secret'
        //   user['password'] = crypto.createHmac('sha256', salt)
        //     .update(user['password'])
        //     .digest('hex')
        // }

          //bcrypt untuk password
          beforeCreate: (user) => {
              const salt = bcrypt.genSaltSync();
              user.password = bcrypt.hashSync(user.password, salt);
          }        
      }, 
      sequelize
  });
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Album, { as: 'Albums', foreignKey: 'AdminId', sourceKey: 'id' })
    User.hasMany(models.Contributor, { as: 'Contributors', foreignKey: 'UserId', sourceKey: 'id' })    
  };
  return User;
};