'use strict';
module.exports = (sequelize, DataTypes) => {
    const account = sequelize.define('account', {
        userId: DataTypes.INTEGER,
        institutionId: DataTypes.INTEGER,
        type: DataTypes.SMALLINT
    }, {paranoid: true});
    account.associate = function (models) {
        // associations can be defined here
        account.belongsTo(models.user);
        account.belongsTo(models.institution);
    };
    account.types = {
        savings: 0,
        current: 1,
        fixed: 2,
        mutualFund: 3,
        employer: 4,
        client: 5,
        loan: 6,
        borrower: 7
    };
    return account;
};
