'use strict';

// Spec §4 permission matrix. Strings must match backend/src/auth/permissions.ts.
const PERMISSIONS = [
  'attendance:read:own',
  'attendance:write',
  'attendance:read:team',
  'attendance:read:all',
  'leave:apply',
  'leave:read:own',
  'leave:cancel:own',
  'leave:read:pending',
  'leave:read:all',
  'leave:approve',
  'leave_type:manage',
  'user:manage',
];

const ROLE_PERMISSIONS = {
  employee: [
    'attendance:read:own',
    'attendance:write',
    'leave:apply',
    'leave:read:own',
    'leave:cancel:own',
  ],
  manager: [
    'attendance:read:own',
    'attendance:write',
    'attendance:read:team',
    'leave:apply',
    'leave:read:own',
    'leave:cancel:own',
    'leave:read:pending',
    'leave:approve',
  ],
  hr: [
    'attendance:read:own',
    'attendance:read:team',
    'attendance:read:all',
    'leave:read:own',
    'leave:read:pending',
    'leave:read:all',
    'leave:approve',
    'leave_type:manage',
    'user:manage',
  ],
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      'roles',
      Object.keys(ROLE_PERMISSIONS).map((name) => ({
        name,
        created_at: now,
        updated_at: now,
      }))
    );

    await queryInterface.bulkInsert(
      'permissions',
      PERMISSIONS.map((name) => ({ name, created_at: now, updated_at: now }))
    );

    const [roleRows] = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles'
    );
    const [permRows] = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions'
    );
    const roleIdByName = Object.fromEntries(
      roleRows.map((r) => [r.name, r.id])
    );
    const permIdByName = Object.fromEntries(
      permRows.map((p) => [p.name, p.id])
    );

    const mappings = [];
    for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
      for (const permName of permNames) {
        mappings.push({
          role_id: roleIdByName[roleName],
          permission_id: permIdByName[permName],
          created_at: now,
          updated_at: now,
        });
      }
    }
    await queryInterface.bulkInsert('role_permissions', mappings);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
