import rateLimit from 'express-rate-limit';

// Strict limit on the login endpoint to deter credential brute-force.
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
