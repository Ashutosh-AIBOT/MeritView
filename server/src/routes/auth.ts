import { Router } from 'express';
import { registerSchema, loginSchema } from '@meritview/shared/src/schemas';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';

const router = Router();

router.post('/register', validate(registerSchema), async (req: any, res: any, next: any) => {
  try {
    const user = await authService.register(req.validated);
    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-email', async (req: any, res: any, next: any) => {
  try {
    const { token } = req.body;
    await authService.verifyEmail(token);
    res.json({ message: 'Email verified' });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req: any, res: any, next: any) => {
  try {
    const tokens = await authService.login(req.validated);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req: any, res: any, next: any) => {
  try {
    const { refresh_token } = req.body;
    const tokens = await authService.refresh(refresh_token);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    await authService.logout(req.user!.id);
    res.json({ message: 'Logged out' });
  } catch (error) {
    next(error);
  }
});

router.post('/password-reset/request', async (req: any, res: any, next: any) => {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    res.json({ message: 'If an account exists, a reset email will be sent' });
  } catch (error) {
    next(error);
  }
});

router.post('/password-reset/complete', async (req: any, res: any, next: any) => {
  try {
    const { token, password } = req.body;
    await authService.completePasswordReset(token, password);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
});

export default router;
