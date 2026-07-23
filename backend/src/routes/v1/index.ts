import { Router } from 'express';
import authRoutes from './auth.routes.ts';
import usersRoutes from './users.routes.ts';
import disputesRoutes from './disputes.routes.ts';
import briefsRoutes from './briefs.routes.ts';
import paymentsRoutes from './payments.routes.ts';
import opinionsRoutes from './opinions.routes.ts';
import adminRoutes from './admin.routes.ts';
import webhooksRoutes from './webhooks.routes.ts';
import healthRoutes from './health.routes.ts';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/disputes', disputesRoutes);
router.use('/disputes', briefsRoutes);
router.use('/disputes', paymentsRoutes);
router.use('/disputes', opinionsRoutes);
router.use('/admin', adminRoutes);
router.use('/webhooks', webhooksRoutes);

export default router;
