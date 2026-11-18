import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && anon ? createClient(url, anon) : null;
const $ = (s) => document.querySelector(s);
const state = { user: null, listings: [], tab: 'search', admin: false };

function shell() {
  $('#app').innerHTML = `
  <header><div class="wrap"><div class="brand">🏠 RENT MATCH</div><p>صحیح پراپرٹی، صحیح کرایہ دار — آسانی سے</p>
  <nav><button data-tab="search" class="active">پراپرٹی تلاش کریں</button><button data-tab="post">اشتہار لگائیں</button><button data-tab="wanted">ضرورت درج کریں</button><button data-tab="account">اکاؤنٹ</button><button data-tab="admin">ایڈمن</button></nav></div></header>
  <main class="wrap">
   <section id="search" class="tab"><div class="panel"><h2>گھر یا دکان تلاش کریں</h2><form id="searchForm" class="grid">
    <label>شہر / علاقہ<input name="area" placeholder="مثلاً خوشاب، جوہرآباد"></label>
    <label>قسم<select name="type"><option value="">دونوں</option><option>گھر</option><option>دکان</option></select></label>
    <label>زیادہ سے زیادہ کرایہ<input name="rent" type="number" min="0"></label>
    <label>زیادہ سے زیادہ ایڈوانس<input name="advance" type="number" min="0"></label>
    <button class="primary">تلاش کریں</button></form></div><div id="results" class="cards"></div></section>

   <section id="post" class="tab hidden"><div class="panel"><h2>پراپرٹی کا اشتہار لگائیں</h2><form id="postForm" class="grid">
    <label>قسم<select name="type"><option>گھر</option><option>دکان</option></select></label>
    <label>شہر / علاقہ<input name="area" required></label>
    <label>ماہانہ کرایہ<input name="rent" type="number" min="1" required></label>
    <label>ایڈوانس<input name="advance" type="number" min="0" value="0"></label>
    <label>سائز / کمرے<input name="size" placeholder="5 مرلہ، 2 کمرے"></label>
    <label>رابطہ موبائل نمبر<input name="owner_phone" type="tel" placeholder="+923001234567" required></label>
    <label>تصاویر (زیادہ سے زیادہ 5)<input name="photos" type="file" accept="image/*" multiple></label>
    <label class="wide">تفصیل<textarea name="description"></textarea></label>
    <button class="primary">اشتہار شائع کریں</button></form>
    <p class="muted">اشتہار شائع کرنے کے لیے پہلے Gmail OTP سے لاگ اِن کریں۔</p></div></section>

   <section id="wanted" class="tab hidden"><div class="panel"><h2>اپنی ضرورت درج کریں</h2><form id="wantedForm" class="grid">
    <label>شہر / علاقہ<input name="area" required></label><label>قسم<select name="type"><option>گھر</option><option>دکان</option></select></label>
    <label>زیادہ سے زیادہ کرایہ<input name="rent" type="number" min="1" required></label><label>زیادہ سے زیادہ ایڈوانس<input name="advance" type="number" min="0"></label>
    <label class="wide">اضافی شرائط<textarea name="notes"></textarea></label><button class="primary">مطابق پراپرٹیز تلاش کریں</button></form></div><div id="wantedResults" class="cards"></div></section>

   <section id="account" class="tab hidden"><div class="panel"><h2>Gmail سے لاگ اِن</h2>
    <form id="otpForm" class="grid"><label>Gmail ایڈریس<input name="email" type="email" placeholder="example@gmail.com" required></label>
    <button class="primary">Gmail OTP بھیجیں</button></form>
    <form id="verifyForm" class="grid hidden"><label>Gmail پر موصول ہونے والا OTP<input name="token" inputmode="numeric" autocomplete="one-time-code" required></label>
    <button class="primary">تصدیق کریں</button></form>
    <p id="accountStatus" class="muted">اپنا Gmail درج کریں، ہم اس پر تصدیقی کوڈ بھیجیں گے۔</p>
    <button id="logout" class="secondary hidden">لاگ آؤٹ</button></div></section>

   <section id="admin" class="tab hidden"><div class="panel"><h2>ایڈمن کنٹرول</h2><p id="adminStatus">ایڈمن اکاؤنٹ سے لاگ اِن کریں۔</p><div id="adminListings" class="cards"></div></div></section>
   <div class="notice">حفاظتی اصول: پراپرٹی دیکھے اور مالک کی شناخت کی تصدیق کیے بغیر ایڈوانس نہ دیں۔ جعلی اشتہار رپورٹ کریں۔</div>
  </main><footer>RENT MATCH ©</footer>`;

  document.querySelectorAll('nav button').forEach(b => b.onclick = () => tab(b.dataset.tab));
  $('#searchForm').onsubmit = e => { e.preventDefault(); loadListings(new FormData(e.target)); };
  $('#postForm').onsubmit = publish;
  $('#wantedForm').onsubmit = matchWanted;
  $('#otpForm').onsubmit = sendOtp;
  $('#verifyForm').onsubmit = verifyOtp;
  $('#logout').onclick = logout;
}

function tab(name) {
  state.tab = name;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('hidden', s.id !== name));
  if (name === 'search') loadListings();
  if (name === 'admin') loadAdmin();
}

function notice(msg) {
  alert(msg);
}

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[c]));
}

function card(x) {
  let imgs = (x.photo_urls || []).map(u => `<img src="${esc(u)}" alt="پراپرٹی">`).join('');
  const phone = String(x.owner_phone || '').replace(/[^\d+]/g, '');
  const whatsapp = phone.replace(/\D/g, '');

  return `<article class="card">${imgs}<div class="body">
    <span class="pill">${esc(x.type)}</span>
    <span class="pill">${esc(x.area)}</span>
    <div class="price">Rs ${Number(x.rent).toLocaleString('en-PK')} / ماہ</div>
    <div>ایڈوانس: Rs ${Number(x.advance || 0).toLocaleString('en-PK')}</div>
    <p>${esc(x.size || '')}</p>
    <p>${esc(x.description || '')}</p>
    <div class="actions">
      <a class="btn primary" href="tel:${esc(phone)}">کال کریں</a>
      <a class="btn secondary" target="_blank" rel="noopener" href="https://wa.me/${esc(whatsapp)}">WhatsApp</a>
      <button class="danger" data-report="${esc(x.id)}">رپورٹ کریں</button>
    </div>
  </div></article>`;
}

function render(items, target = 'results') {
  $('#' + target).innerHTML = items.length
    ? items.map(card).join('')
    : '<div class="empty">اس وقت کوئی مناسب پراپرٹی نہیں ملی۔</div>';

  document.querySelectorAll('[data-report]').forEach(b => {
    b.onclick = () => reportListing(b.dataset.report);
  });
}

async function loadListings(form = null) {
  if (!supabase) {
    $('#results').innerHTML = '<div class="empty">آن لائن ڈیٹابیس سیٹ اپ کرنے کے بعد لسٹنگز یہاں نظر آئیں گی۔</div>';
    return;
  }

  let q = supabase.from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', {ascending: false});

  if (form) {
    let a = form.get('area')?.trim();
    let t = form.get('type');
    let r = form.get('rent');
    let v = form.get('advance');

    if (a) q = q.ilike('area', `%${a}%`);
    if (t) q = q.eq('type', t);
    if (r) q = q.lte('rent', Number(r));
    if (v) q = q.lte('advance', Number(v));
  }

  const {data, error} = await q;

  if (error) {
    notice(error.message);
    return;
  }

  state.listings = data || [];
  render(state.listings);
}

async function sendOtp(e) {
  e.preventDefault();

  if (!supabase) return notice('پہلے Supabase کنفیگریشن مکمل کریں۔');

  const email = new FormData(e.target)
    .get('email')
    .trim()
    .toLowerCase();

  const {error} = await supabase.auth.signInWithOtp({
    email,
    options: {shouldCreateUser: true}
  });

  if (error) return notice(error.message);

  $('#verifyForm').classList.remove('hidden');
  $('#accountStatus').textContent =
    'Gmail پر OTP بھیج دیا گیا ہے۔ اپنا کوڈ درج کریں۔';
}

async function verifyOtp(e) {
  e.preventDefault();

  if (!supabase) return notice('Supabase کنفیگریشن مکمل نہیں۔');

  const email = new FormData($('#otpForm'))
    .get('email')
    .trim()
    .toLowerCase();

  const token = new FormData(e.target)
    .get('token')
    .trim();

  const {data, error} = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (error) return notice(error.message);

  state.user = data.user;

  $('#accountStatus').textContent =
    'لاگ اِن کامیاب: ' + (data.user.email || '');

  $('#logout').classList.remove('hidden');
  $('#verifyForm').classList.add('hidden');

  await refreshUser();
}

async function refreshUser() {
  if (!supabase) return;

  const {data} = await supabase.auth.getUser();
  state.user = data.user;

  if (state.user) {
    const {data: p} = await supabase
      .from('profiles')
      .select('role')
      .eq('id', state.user.id)
      .maybeSingle();

    state.admin = p?.role === 'admin';

    if ($('#accountStatus')) {
      $('#accountStatus').textContent =
        'لاگ اِن ہیں: ' + (state.user.email || '');
    }

    if ($('#logout')) {
      $('#logout').classList.remove('hidden');
    }
  } else {
    state.admin = false;
  }
}

async function logout() {
  if (!supabase) return;

  await supabase.auth.signOut();

  state.user = null;
  state.admin = false;

  $('#accountStatus').textContent = 'آپ لاگ آؤٹ ہیں۔';
  $('#logout').classList.add('hidden');
  $('#verifyForm').classList.add('hidden');
}

async function publish(e) {
  e.preventDefault();

  if (!supabase) return notice('پہلے Supabase کنفیگریشن مکمل کریں۔');
  if (!state.user) return notice('پہلے Gmail OTP سے لاگ اِن کریں۔');

  const f = new FormData(e.target);
  const phone = String(f.get('owner_phone') || '').trim();

  if (!phone) return notice('رابطہ موبائل نمبر درج کریں۔');

  let photos = [];

  for (const file of f.getAll('photos').filter(x => x.size)) {
    if (file.size > 5 * 1024 * 1024) {
      return notice('ہر تصویر 5MB سے کم ہونی چاہیے۔');
    }

    const path = `${state.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const up = await supabase.storage
      .from('listing-photos')
      .upload(path, file, {upsert: false});

    if (up.error) return notice(up.error.message);

    const pub = supabase.storage
      .from('listing-photos')
      .getPublicUrl(path);

    photos.push(pub.data.publicUrl);
  }

  const {error} = await supabase.from('listings').insert({
    owner_id: state.user.id,
    owner_phone: phone,
    type: f.get('type'),
    area: f.get('area').trim(),
    rent: Number(f.get('rent')),
    advance: Number(f.get('advance') || 0),
    size: f.get('size'),
    description: f.get('description'),
    photo_urls: photos
  });

  if (error) return notice(error.message);

  notice('اشتہار جمع ہوگیا۔ منظوری کے بعد نظر آئے گا۔');

  e.target.reset();
  tab('search');
}

async function matchWanted(e) {
  e.preventDefault();

  if (!supabase) return notice('پہلے Supabase کنفیگریشن مکمل کریں۔');

  const f = new FormData(e.target);
  const a = f.get('area').trim();

  const {data, error} = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .ilike('area', `%${a}%`)
    .eq('type', f.get('type'))
    .lte('rent', Number(f.get('rent')))
    .lte('advance', Number(f.get('advance') || 999999999));

  if (error) return notice(error.message);

  render(data || [], 'wantedResults');
}

async function reportListing(id) {
  if (!state.user) {
    return notice('رپورٹ کرنے کے لیے پہلے Gmail سے لاگ اِن کریں۔');
  }

  const reason = prompt('رپورٹ کی وجہ لکھیں:');

  if (!reason) return;

  const {error} = await supabase.from('listing_reports').insert({
    listing_id: id,
    reporter_id: state.user.id,
    reason
  });

  notice(error
    ? 'رپورٹ جمع نہیں ہوئی: ' + error.message
    : 'رپورٹ ایڈمن کو بھیج دی گئی۔');
}

async function loadAdmin() {
  if (!supabase) return;

  await refreshUser();

  if (!state.admin) {
    $('#adminStatus').textContent =
      'یہ حصہ صرف مقرر کردہ ایڈمن کے لیے ہے۔';
    return;
  }

  $('#adminStatus').textContent = 'ایڈمن موڈ فعال';

  const {data, error} = await supabase
    .from('listings')
    .select('*')
    .order('created_at', {ascending: false});

  if (error) return notice(error.message);

  $('#adminListings').innerHTML = (data || []).map(x =>
    `${card(x)}
    <div class="actions">
      <button class="primary" data-approve="${esc(x.id)}">منظور / فعال</button>
      <button class="danger" data-remove="${esc(x.id)}">ہٹائیں</button>
    </div>`
  ).join('');

  document.querySelectorAll('[data-approve]').forEach(b => {
    b.onclick = () => moderate(b.dataset.approve, 'active');
  });

  document.querySelectorAll('[data-remove]').forEach(b => {
    b.onclick = () => moderate(b.dataset.remove, 'removed');
  });
}

async function moderate(id, status) {
  const {error} = await supabase
    .from('listings')
    .update({status})
    .eq('id', id);

  if (error) return notice(error.message);

  loadAdmin();
}

shell();

if (supabase) {
  supabase.auth.onAuthStateChange(() => {
    refreshUser();
  });

  refreshUser();
  loadListings();
} else {
  $('#results').innerHTML =
    '<div class="empty">پہلے .env فائل میں Supabase URL اور anon key درج کریں۔</div>';
    }
