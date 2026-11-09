import 'server-only';
import { hash, verify } from '@node-rs/argon2';
import { z } from 'zod';

// Argon2id بمعاملات OWASP (كما في ركين).
const OPTIONS = { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

let dummy: Promise<string> | null = null;
export function getDummyHash(): Promise<string> {
  dummy ??= hashPassword('basatim-dummy-password-for-timing');
  return dummy;
}

export const passwordPolicy = z
  .string()
  .min(8, 'يجب ألا تقل كلمة المرور عن 8 خانات.')
  .max(128, 'كلمة المرور طويلة جداً.')
  .refine((v) => /[a-zA-Z؀-ۿ]/.test(v) && /[0-9]/.test(v), {
    message: 'يجب أن تحتوي كلمة المرور على حروف وأرقام.',
  });
