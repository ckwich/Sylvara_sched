import type { FastifyInstance } from 'fastify';
import type { AppDeps } from './scheduling/_shared.js';
import { registerForemanReadRoutes } from './scheduling/foreman-read-routes.js';
import { registerOneClickRoutes } from './scheduling/one-click-routes.js';
import { registerOrgSettingsRoutes } from './scheduling/org-settings-routes.js';
import { registerPreferredChannelsRoutes } from './scheduling/preferred-channels-routes.js';
import { registerSegmentRoutes } from './scheduling/segment-routes.js';
import { registerTravelRoutes } from './scheduling/travel-routes.js';

export function registerSchedulingRoutes(app: FastifyInstance, deps: AppDeps) {
  registerPreferredChannelsRoutes(app, deps);
  registerOrgSettingsRoutes(app, deps);
  registerForemanReadRoutes(app, deps);
  registerTravelRoutes(app, deps);
  registerSegmentRoutes(app, deps);
  registerOneClickRoutes(app, deps);
}
