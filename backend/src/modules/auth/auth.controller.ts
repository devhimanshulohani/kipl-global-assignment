import { Request, Response } from 'express';
import * as authService from './auth.service';
import { env } from '../../config/env';
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from '../../constants/auth';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.cookie(SESSION_COOKIE_NAME, result.token, {
    ...cookieOptions,
    maxAge: SESSION_TTL_MS,
  });
  res.json({ user: result.user });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (token) {
    await authService.logout(token);
  }
  res.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
  res.status(204).send();
};

export const me = async (req: Request, res: Response) => {
  res.json(authService.serializeAuthUser(req.user!));
};
