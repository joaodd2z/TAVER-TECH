import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

type Role = 'admin' | 'moderator' | 'publisher';
export interface User { id: string; email: string; role: Role; password_hash: string }

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change';

export function signToken(user: Pick<User,'id'|'email'|'role'>) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function verifyToken(token: string) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}