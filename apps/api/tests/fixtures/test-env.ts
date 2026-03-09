import { warmTokenCache } from './test-auth.js';

// Every userId+role pair used across smoke and unit tests.
// If you add a new test user, add its combo here too.
const COMMON_TEST_USERS = [
  // Most smoke tests use this as MANAGER
  { userId: '11111111-1111-4111-8111-111111111111', role: 'MANAGER' },
  // role-enforcement.test.ts uses it as VIEWER
  { userId: '11111111-1111-4111-8111-111111111111', role: 'VIEWER' },
  // pushup.test.ts uses this as VIEWER
  { userId: '11111111-1111-4111-8111-111111111112', role: 'VIEWER' },
  // admin.test.ts uses this as VIEWER; reports/role-enforcement/snapshot as SCHEDULER
  { userId: '22222222-2222-4222-8222-222222222222', role: 'VIEWER' },
  { userId: '22222222-2222-4222-8222-222222222222', role: 'SCHEDULER' },
  // reports/resources/snapshot use this as VIEWER; role-enforcement as MANAGER
  { userId: '33333333-3333-4333-8333-333333333333', role: 'VIEWER' },
  { userId: '33333333-3333-4333-8333-333333333333', role: 'MANAGER' },
  // preferred_channels_auth.test.ts
  { userId: '42424242-4242-4242-8242-424242424242', role: 'MANAGER' },
  // org_settings.test.ts
  { userId: '77777777-7777-4777-8777-777777777777', role: 'MANAGER' },
  { userId: '99999999-9999-4999-8999-999999999999', role: 'MANAGER' },
  // close_out_day_end_travel.test.ts — nonexistent user for 401 test
  { userId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', role: 'MANAGER' },
];

await warmTokenCache(COMMON_TEST_USERS);
