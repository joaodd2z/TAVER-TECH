import fs from 'fs';
import { emitTaverEvent } from '@/lib/realtime';

export async function awardXP(amount: number, reason: string) {
  const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
  seed.admin.profile = seed.admin.profile || { xp: 0, level: 1 };
  seed.admin.profile.xp += amount;
  seed.analytics_events = seed.analytics_events || [];
  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'xp_awarded', payload: { amount, reason }, created_at: new Date().toISOString() });

  let leveledUp = false;
  while (seed.admin.profile.xp >= seed.admin.profile.level * 150) {
    seed.admin.profile.level += 1;
    leveledUp = true;
  }

  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  if (leveledUp) {
    await emitTaverEvent('level_up', { user: seed.admin.email, level: seed.admin.profile.level });
    seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'level_up', payload: { level: seed.admin.profile.level }, created_at: new Date().toISOString() });
    fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  }
}