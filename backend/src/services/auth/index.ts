import { prisma } from '../../db/prisma.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../../config/env.ts';
import { redis } from '../../config/redis.ts';
import type { RegisterInput, LoginInput } from '../types/index.ts';

const ACCESS_SECRET = env.JWT_SECRET;
const REFRESH_SECRET = env.JWT_SECRET;
const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';
const VERIFICATION_EXPIRY = '24h';
const PASSWORD_RESET_EXPIRY = '1h';

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 409, code: 'DUPLICATE_EMAIL' });

  const passwordHash = await bcrypt.hash(input.password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      displayName: input.display_name ?? null,
      marketingOptIn: input.marketing_opt_in ?? false,
      preferredLlmProvider: input.preferred_llm_provider ?? null,
      emailVerified: false,
    verificationToken,
    verificationExpires,
  } as any,
});

await redis.setex(`verification:${verificationToken}`, 24 * 60 * 60, user.id);

  return { user: { id: user.id, email: user.email, displayName: user.displayName, emailVerified: user.emailVerified }, verificationToken };
}

export async function verifyEmail(token: string) {
  const userId = await redis.get(`verification:${token}`);
  if (!userId) throw Object.assign(new Error('Invalid or expired verification token'), { status: 400, code: 'INVALID_TOKEN' });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true, verificationToken: null, verificationExpires: null },
  });

  await redis.del(`verification:${token}`);
  return { user: { id: user.id, email: user.email, emailVerified: true } };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401, code: 'INVALID_CREDENTIALS' });

  if (!user.emailVerified) throw Object.assign(new Error('Email not verified'), { status: 403, code: 'EMAIL_NOT_VERIFIED' });

  const valid = await bcrypt.compare(input.password, user.passwordHash ?? '');
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401, code: 'INVALID_CREDENTIALS' });

  const accessToken = jwt.sign({ sub: user.id, admin: user.role === 'admin', support: user.role === 'support' }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
  const refreshToken = jwt.sign({ sub: user.id, type: 'refresh' }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } };
}

export async function refreshToken(token: string) {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as any;
    if (payload.type !== 'refresh') throw new Error('Invalid token type');

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw Object.assign(new Error('User not found'), { status: 401, code: 'USER_NOT_FOUND' });

    const accessToken = jwt.sign({ sub: user.id, admin: user.role === 'admin', support: user.role === 'support' }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
    const newRefreshToken = jwt.sign({ sub: user.id, type: 'refresh' }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });

    await redis.del(`refresh:${token}`);
    await redis.setex(`refresh:${newRefreshToken}`, 7 * 24 * 60 * 60, user.id);

    return { accessToken, refreshToken: newRefreshToken };
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401, code: 'INVALID_REFRESH_TOKEN' });
  }
}

export async function logout(token: string) {
  await redis.del(`refresh:${token}`);
  return { success: true };
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: true };

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetExpires } });
  await redis.setex(`reset:${resetToken}`, 60 * 60, user.id);

  return { success: true };
}

export async function completePasswordReset(token: string, newPassword: string) {
  const userId = await redis.get(`reset:${token}`);
  if (!userId) throw Object.assign(new Error('Invalid or expired reset token'), { status: 400, code: 'INVALID_TOKEN' });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, resetToken: null, resetExpires: null },
  });

  await redis.del(`reset:${token}`);
  return { user: { id: user.id, email: user.email } };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: { id: true, email: true, emailVerified: true, displayName: true, role: true, accountType: true, marketingOptIn: true, preferredLlmProvider: true, createdAt: true, lastLoginAt: true },
  });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404, code: 'NOT_FOUND' });
  return user;
}

export async function updateMe(userId: string, data: { display_name?: string; marketing_opt_in?: boolean; preferred_llm_provider?: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: data.display_name,
      marketingOptIn: data.marketing_opt_in,
      preferredLlmProvider: data.preferred_llm_provider,
    },
    select: { id: true, email: true, displayName: true, marketingOptIn: true, preferredLlmProvider: true },
  });
  return user;
}

export async function deleteAccount(userId: string) {
  const activeDisputes = await prisma.dispute.count({
    where: {
      initiatorUserId: userId,
      state: { notIn: ['completed', 'failed', 'withdrawn'] },
    },
  });

  if (activeDisputes > 0) throw Object.assign(new Error('Cannot delete account with active disputes'), { status: 400, code: 'ACTIVE_DISPUTES_EXIST' });

  await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
  return { success: true };
}
