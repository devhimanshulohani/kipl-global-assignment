'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('password123', 10);

    const [roleRows] = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles'
    );
    const roleIdByName = Object.fromEntries(
      roleRows.map((r) => [r.name, r.id])
    );

    await queryInterface.bulkInsert('users', [
      {
        username: 'hr1',
        password_hash: passwordHash,
        role_id: roleIdByName.hr,
        parent_id: null,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    const [hrResults] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE username = 'hr1' LIMIT 1"
    );
    const hrId = hrResults[0].id;

    await queryInterface.bulkInsert('users', [
      {
        username: 'manager1',
        password_hash: passwordHash,
        role_id: roleIdByName.manager,
        parent_id: hrId,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    const [managerResults] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE username = 'manager1' LIMIT 1"
    );
    const managerId = managerResults[0].id;

    await queryInterface.bulkInsert('users', [
      {
        username: 'employee1',
        password_hash: passwordHash,
        role_id: roleIdByName.employee,
        parent_id: managerId,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
