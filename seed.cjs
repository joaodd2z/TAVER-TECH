const fs = require('fs');
const bcrypt = require('bcryptjs');

function iso(days) { return new Date(Date.now() + days*86400000).toISOString(); }

async function run() {
  const admin = {
    email: 'admin@gamehouse.local',
    password_hash: await bcrypt.hash('changeme', 10),
    role: 'admin',
    created_at: new Date().toISOString(),
    profile: { xp: 50, level: 2 }
  };

  const coupons = [
    { id:'c1', platform:'Shopee', product_name:'Fone Gamer', affiliate_link:'https://shopee.com/fonegamer', coupon_code:'WELCOME10', discount_percent:10, expires_at: iso(14), usage_count:0, created_by:'admin', status:'active', tags:['audio'], created_at:new Date().toISOString() },
    { id:'c2', platform:'Amazon', product_name:'Mouse Óptico', affiliate_link:'https://amazon.com/mouse', coupon_code:'BOSSFIGHT', discount_percent:25, expires_at: iso(7), usage_count:0, created_by:'admin', status:'active', tags:['peripheral'], created_at:new Date().toISOString() },
    { id:'c3', platform:'AliExpress', product_name:'Teclado Mecânico', affiliate_link:'https://aliexpress.com/teclado', coupon_code:'KEYS15', discount_percent:15, expires_at: iso(21), usage_count:0, created_by:'admin', status:'active', tags:['keyboard'], created_at:new Date().toISOString() },
    { id:'c4', platform:'Shopee', product_name:'Headset', affiliate_link:'https://shopee.com/headset', coupon_code:'SOUND20', discount_percent:20, expires_at: iso(10), usage_count:0, created_by:'admin', status:'active', tags:['audio'], created_at:new Date().toISOString() },
    { id:'c5', platform:'Amazon', product_name:'Webcam HD', affiliate_link:'https://amazon.com/webcam', coupon_code:'CAM5', discount_percent:5, expires_at: iso(30), usage_count:0, created_by:'admin', status:'active', tags:['video'], created_at:new Date().toISOString() },
    { id:'c6', platform:'Shopee', product_name:'Cadeira Gamer', affiliate_link:'https://shopee.com/cadeira', coupon_code:'CHAIR12', discount_percent:12, expires_at: iso(12), usage_count:0, created_by:'admin', status:'active', tags:['furniture'], created_at:new Date().toISOString() },
    { id:'c7', platform:'Amazon', product_name:'Monitor 27"', affiliate_link:'https://amazon.com/monitor', coupon_code:'VIEW18', discount_percent:18, expires_at: iso(25), usage_count:0, created_by:'admin', status:'active', tags:['display'], created_at:new Date().toISOString() },
    { id:'c8', platform:'AliExpress', product_name:'SSD NVMe', affiliate_link:'https://aliexpress.com/ssd', coupon_code:'FAST30', discount_percent:30, expires_at: iso(5), usage_count:0, created_by:'admin', status:'active', tags:['storage'], created_at:new Date().toISOString() },
    { id:'c9', platform:'Amazon', product_name:'Microfone USB', affiliate_link:'https://amazon.com/mic', coupon_code:'VOICE22', discount_percent:22, expires_at: iso(18), usage_count:0, created_by:'admin', status:'active', tags:['audio'], created_at:new Date().toISOString() },
    { id:'c10', platform:'Shopee', product_name:'Controle Bluetooth', affiliate_link:'https://shopee.com/controle', coupon_code:'PLAY8', discount_percent:8, expires_at: iso(40), usage_count:0, created_by:'admin', status:'active', tags:['controller'], created_at:new Date().toISOString() },
  ];

  const assets = [
    { id:'a1', title:'Logo Brand', type:'image', url:'https://example.com/logo.svg', uploaded_by:'admin', tags:['Brand'], meta:{size:12,ext:'svg',mime:'image/svg+xml'}, created_at:new Date().toISOString() },
    { id:'a2', title:'Template Post', type:'template', url:'https://example.com/template.fig', uploaded_by:'admin', tags:['Templates'], meta:{size:2048,ext:'fig',mime:'application/octet-stream'}, created_at:new Date().toISOString() },
    { id:'a3', title:'Imagem Banner', type:'image', url:'https://example.com/banner.jpg', uploaded_by:'admin', tags:['Mockups'], meta:{size:512,ext:'jpg',mime:'image/jpeg'}, created_at:new Date().toISOString() },
    { id:'a4', title:'Vídeo Review', type:'video', url:'https://example.com/review.mp4', uploaded_by:'admin', tags:['Vídeos'], meta:{size:51200,ext:'mp4',mime:'video/mp4'}, created_at:new Date().toISOString() },
    { id:'a5', title:'Documento Brief', type:'doc', url:'https://example.com/brief.pdf', uploaded_by:'admin', tags:['Docs'], meta:{size:1024,ext:'pdf',mime:'application/pdf'}, created_at:new Date().toISOString() },
    { id:'a6', title:'Copy Base', type:'link', url:'https://example.com/copy', uploaded_by:'admin', tags:['Copies'], meta:{}, created_at:new Date().toISOString() },
    { id:'a7', title:'Mockup Produto', type:'image', url:'https://example.com/mockup.png', uploaded_by:'admin', tags:['Mockups'], meta:{size:728,ext:'png',mime:'image/png'}, created_at:new Date().toISOString() },
    { id:'a8', title:'Template Stories', type:'template', url:'https://example.com/stories.fig', uploaded_by:'admin', tags:['Templates'], meta:{size:1024,ext:'fig'}, created_at:new Date().toISOString() },
  ];

  const missions = [
    { id:'m1', title:'Post Shopee Fone', description:'Criar post promo', status:'todo', xp_reward:50, assigned_to:null, attachments:['a3'], created_at:new Date().toISOString(), due_date: iso(3) },
    { id:'m2', title:'Review Monitor', description:'Escrever análise', status:'inprogress', xp_reward:75, assigned_to:'admin', attachments:['a4'], created_at:new Date().toISOString(), due_date: iso(5) },
    { id:'m3', title:'Template Amazon', description:'Criar template', status:'todo', xp_reward:60, assigned_to:null, attachments:['a2'], created_at:new Date().toISOString(), due_date: iso(7) },
    { id:'m4', title:'Copy AliExpress', description:'Geração de copy', status:'todo', xp_reward:25, assigned_to:null, attachments:['a6'], created_at:new Date().toISOString() },
    { id:'m5', title:'Post SSD NVMe', description:'Publicar teste', status:'todo', xp_reward:100, assigned_to:null, attachments:['a7'], created_at:new Date().toISOString(), due_date: iso(2) },
  ];

  const shortlinks = [
    { slug:'tgh-welc10', target_url:'https://shopee.com/fonegamer?code=WELCOME10', created_by:'admin', clicks:0, created_at:new Date().toISOString() }
  ];

  const analytics_events = [];

  const seed = { admin, coupons, assets, missions, shortlinks, analytics_events };
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  console.log('Seed generated -> seed.json');
}

run();