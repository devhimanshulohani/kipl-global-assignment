'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('leave_types', [
      { name: 'Casual Leave', annual_quota: 12, created_at: now, updated_at: now },
      { name: 'Sick Leave', annual_quota: 10, created_at: now, updated_at: now },
      { name: 'Earned Leave', annual_quota: 15, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('leave_types', null, {});
  },
};
