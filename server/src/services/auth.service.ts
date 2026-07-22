import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { registerSchema, loginSchema } from '@meritview/shared/src/schemas';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export async function register(input: z.infer<typeof registerSchema>) {
  const { email, password, display_name, accept_terms } = input;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    (error as any).statusCode = 409;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password_hash, display_name, account_type: 'standard' },
  });

  // TODO: queue email verification
  return user;
}

export async function verifyEmail(token: string) {
  // verify token
  return { verified: true };
}

export async function login(input: z.infer<typeof loginSchema>) {
  const { email, password } = input;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid credentials');
    (error as any).statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    (error as any).statusCode = 401;
    throw error;
  }

  if (!user.email_verified) {
    const error = new Error('Email not verified');
    (error as any).statusCode = 403;
    throw error;
  }

  const payload = { sub: user.id, email: user.email, role: user.account_type };
  return {
    access_token: jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_ACCESS_EXPIRY } as jwt.SignOptions),
    refresh_token: jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_REFRESH_EXPIRY } as jwt.SignOptions),
  };
}

export async function refresh(refresh_token: string) {
  try {
    const payload = jwt.verify(refresh_token, JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.deleted_at) {
      const error = new Error('Invalid refresh token');
      (error as any).statusCode = 401;
      throw error;
    }
    return {
      access_token: jwt.sign({ sub: user.id, email: user.email, role: user.account_type }, JWT_SECRET!, { expiresIn: JWT_ACCESS_EXPIRY } as jwt.SignOptions),
      refresh_token,
    };
  } catch {
    const error = new Error('Invalid refresh token');
    (error as any).statusCode = 401;
    throw error;
  }
}

export async function logout(userId: string) {
  // TODO: invalidate refresh token in DB
  return { loggedOut: true };
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { sent: true };
  // TODO: generate reset token and queue email
  return { sent: true };
}

export async function completePasswordReset(token: string, newPassword: string) {
  // verify token
  const password_hash = await bcrypt.hash(newPassword, 12);
  // update user password
  return { reset: true };
}
