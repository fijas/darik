'use strict';
module.exports = (sequelize, DataTypes) => {
    const account = sequelize.define('account', {
        userId: DataTypes.INTEGER,
        institutionId: DataTypes.INTEGER,
        type: DataTypes.SMALLINT
    }, {});
    account.associate = function (models) {
        // associations can be defined here
        account.belongsTo(models.user);
        account.belongsTo(models.institution);
    };
    account.types = {
        savings: 0,
        current: 1,
        mutualFund: 2,
        employer: 3,
        client: 4,
        loan: 5,
        borrower: 6
    };
    return account;
};
