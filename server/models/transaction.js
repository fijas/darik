'use strict';
module.exports = (sequelize, DataTypes) => {
    const transaction = sequelize.define('transaction', {
        userId: DataTypes.INTEGER,
        accountId: DataTypes.INTEGER,
        categoryId: DataTypes.INTEGER,
        subcategoryId: DataTypes.INTEGER,
        debit: DataTypes.DECIMAL,
        credit: DataTypes.DECIMAL,
        note: DataTypes.TEXT
    }, {paranoid: true});
    transaction.associate = function (models) {
        // associations can be defined here
        transaction.belongsTo(models.category);
        transaction.belongsTo(models.subcategory);
        transaction.belongsTo(models.account);
        transaction.belongsTo(models.user);
    };
    return transaction;
};
