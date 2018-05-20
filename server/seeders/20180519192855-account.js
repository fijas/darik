'use strict';
let faker = require("faker");

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('accounts', [{
          userId: 1,
          institutionId: 1,
          type: 0, //savings
          createdAt: faker.date.recent(),
          updatedAt: faker.date.recent()
      }], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('accounts', null, {});
  }
};
