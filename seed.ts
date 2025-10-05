/** Seed basic admin and sample content */
import bcrypt from 'bcryptjs';
import fs from 'fs';

async function run() {
  const admin = {
    email: 'admin@gamehouse.local',
    password_hash: await bcrypt.hash('changeme', 10),
    role: 'admin',
    created_at: new Date().toISOString(),
    profile: { xp: 0, level: 1 }
  };

  const coupons = [
    { code: 'WELCOME10', discount: 10, active: true },
    { code: 'BOSSFIGHT', discount: 25, active: true }
  ];

  const assets = [{ name: 'Starter Pack', type: 'bundle' }];
  const missions = [{ title: 'Onboard Players', status: 'active' }];

  const seed = { admin, coupons, assets, missions };
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  console.log('Seed generated -> seed.json');
}

run();