'use strict';
module.exports = (sequelize, DataTypes) => {
    var subcategory = sequelize.define('subcategory', {
        name: DataTypes.STRING,
        categoryId: DataTypes.INTEGER
    }, {});
    subcategory.associate = function (models) {
        // associations can be defined here
        subcategory.belongsTo(models.category);
    };
    return subcategory;
};
