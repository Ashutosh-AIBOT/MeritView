import { Router } from 'express';
import { z } from 'zod';
import { register, verifyEmail as verifyEmailService, login, refreshToken as refreshService, logout as logoutService, requestPasswordReset as requestReset, completePasswordReset as completeReset, getMe, updateMe, deleteAccount } from '../../services/auth/index.ts';
import { validate } from '../middleware/validate.ts';
import { requireAuth } from '../middleware/auth.ts';
import { loginRateLimit } from '../middleware/rateLimit.ts';

const router = Router();

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8),
  display_name: z.string().max(100).optional(),
  accept_terms: z.literal(true),
  marketing_opt_in: z.boolean().optional(),
  preferred_llm_provider: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw Object.assign(new Error('Token required'), { status: 400, code: 'MISSING_TOKEN' });
    const result = await verifyEmailService(token);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/login', loginRateLimit, validate(loginSchema), async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw Object.assign(new Error('Token required'), { status: 400, code: 'MISSING_TOKEN' });
    const result = await refreshService(token);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw Object.assign(new Error('Token required'), { status: 400, code: 'MISSING_TOKEN' });
    await logoutService(token);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

const passwordResetRequestSchema = z.object({ email: z.string().email() });
router.post('/password-reset/request', validate(passwordResetRequestSchema), async (req, res, next) => {
  try {
    await requestReset(req.body.email);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});
router.post('/password-reset/complete', validate(passwordResetSchema), async (req, res, next) => {
  try {
    const result = await completeReset(req.body.token, req.body.password);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/users/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getMe((req as any).user.sub);
    res.json(user);
  } catch (e) {
    next(e);
  }
});

const updateMeSchema = z.object({
  display_name: z.string().max(100).optional(),
  marketing_opt_in: z.boolean().optional(),
  preferred_llm_provider: z.string().optional(),
});
router.patch('/users/me', requireAuth, validate(updateMeSchema), async (req, res, next) => {
  try {
    const user = await updateMe((req as any).user.sub, req.body);
    res.json(user);
  } catch (e) {
    next(e);
  }
});

router.delete('/users/me', requireAuth, async (req, res, next) => {
  try {
    await deleteAccount((req as any).user.sub);
    res.status(202).json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
