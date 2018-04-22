'use strict';
module.exports = (sequelize, DataTypes) => {
    var institution = sequelize.define('institution', {
        name: DataTypes.STRING,
        type: DataTypes.SMALLINT,
        userId: DataTypes.INTEGER
    }, {});
    institution.associate = function (models) {
        // associations can be defined here
        institution.belongsTo(models.user);
    };
    return institution;
};
