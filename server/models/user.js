'use strict';
module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define('user', {
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        status: DataTypes.SMALLINT
    }, {});
    user.associate = function (models) {
        // associations can be defined here
    };
    user.statusCodes = {
        active: 10,
        inactive: 1,
        deleted: 0
    };
    return user;
};
