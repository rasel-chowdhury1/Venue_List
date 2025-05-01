import { Router } from 'express';
import { discoverMauritiusController } from './discoverMauritius.controller';

const router = Router();

router.get("/", discoverMauritiusController.getAllDiscoverMauritius)

export const discoverMauritiusRoutes = router;