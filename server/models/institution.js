'use strict';
module.exports = (sequelize, DataTypes) => {
    const institution = sequelize.define('institution', {
        name: DataTypes.STRING,
        type: DataTypes.SMALLINT,
        userId: DataTypes.INTEGER
    }, {});
    institution.associate = function (models) {
        // associations can be defined here
        institution.belongsTo(models.user);
    };
    institution.types = {
        bank: 0,
        company: 1,
        individual: 2,
        employer: 3,
        client: 4
    };
    return institution;
};
