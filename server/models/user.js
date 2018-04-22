'use strict';
module.exports = (sequelize, DataTypes) => {
    var user = sequelize.define('user', {
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        status: DataTypes.SMALLINT
    }, {});
    user.associate = function (models) {
        // associations can be defined here
    };
    return user;
};
