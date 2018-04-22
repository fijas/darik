'use strict';
module.exports = (sequelize, DataTypes) => {
    var account = sequelize.define('account', {
        userId: DataTypes.INTEGER,
        institutionId: DataTypes.INTEGER,
        type: DataTypes.SMALLINT
    }, {});
    account.associate = function (models) {
        // associations can be defined here
        account.belongsTo(models.user);
        account.belongsTo(models.institution);
    };
    return account;
};
