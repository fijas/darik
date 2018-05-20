'use strict';
let faker = require("faker");

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('institutions', [{
          name: faker.company.title,
          type: 0, //bank
          userId: 1,
          createdAt: faker.date.recent(),
          updatedAt: faker.date.recent()
      }], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('institutions', null, {});
  }
};
