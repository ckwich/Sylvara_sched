const DEFAULT_LAN_SHARED_SECRET = 'office-shared-secret-123456';

process.env.LAN_MODE = 'true';
if (!process.env.LAN_SHARED_SECRET) {
  process.env.LAN_SHARED_SECRET = DEFAULT_LAN_SHARED_SECRET;
}

