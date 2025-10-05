export function randomSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `tgh-${s}`;
}

export function nowISO() { return new Date().toISOString(); }