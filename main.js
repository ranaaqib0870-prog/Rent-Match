import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && anon ? createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;

const $ = (s) => document.querySelector(s);
const state = { user: null, listings: [], tab: 'search', admin: false, location: null };

function notice(message) { alert(message); }
function esc(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function shell() {
  $('#app').innerHTML = `
  <header><div class="wrap"><div class="brand">🏠 RENT MATCH</div>
    <p>صحیح پراپرٹی، صحیح کرایہ دار — آسانی سے</p>
    <nav>
      <button data-tab="search" class="active">پراپرٹی تلاش کریں</button>
      <button data-tab="post">اشتہار لگائیں</button>
      <button data-tab="wanted">ضرورت درج کریں</button>
      <button data-tab="account">اکاؤنٹ</button>
      <button data-tab="admin">ایڈمن</button>
    </nav></div></header>
  <main class="wrap">
    <section id="search" class="tab"><div class="panel">
      <h2>گھر یا دکان تلاش کریں</h2><p id="locationStatus" class="muted">آپ کے علاقے کی پراپرٹیز تلاش کی جا رہی ہیں…</p>
      <form id="searchForm" class="grid">
        <label>شہر / علاقہ<input name="area" placeholder="مثلاً خوشاب، جوہرآباد"></label>
        <label>قسم<select name="type"><option value="">دونوں</option><option>گھر</option><option>دکان</option></select></label>
        <label>زیادہ سے زیادہ کرایہ<input name="rent" type="number" min="0"></label>
        <label>زیادہ سے زیادہ ایڈوانس<input name="advance" type="number" min="0"></label>
        <button class="primary">تلاش کریں</button>
        <button type="button" id="nearMe" class="secondary">میری موجودہ لوکیشن</button>
      </form></div><div id="results" class="cards"></div></section>
    <section id="post" class="tab hidden"><div class="panel"><h2>پراپرٹی کا اشتہار لگائیں</h2>
      <form id="postForm" class="grid">
        <label>قسم<select name="type"><option>گھر</option><option>دکان</option></select></label>
        <label>شہر / علاقہ<input name="area" required></label>
        <label>ماہانہ کرایہ<input name="rent" type="number" min="1" required></label>
        <label>ایڈوانس<input name="advance" type="number" min="0" value="0"></label>
        <label>سائز / کمرے<input name="size" placeholder="5 مرلہ، 2 کمرے"></label>
        <label>رابطہ موبائل نمبر<input name="owner_phone" type="tel" required></label>
        <label>تصاویر (زیادہ سے زیادہ 5)<input name="photos" type="file" accept="image/*" multiple></label>
        <label class="wide">تفصیل<textarea name="description"></textarea></label>
        <button class="primary">اشتہار شائع کریں</button>
      </form><p class="muted">اشتہار لگانے کے لیے پہلے Gmail سے لاگ اِن کریں۔ اشتہار جمع ہوتے ہی شائع ہوگا۔</p>
    </div></section>
    <section id="wanted" class="tab hidden"><div class="panel"><h2>اپنی ضرورت درج کریں</h2>
      <form id="wantedForm" class="grid">
        <label>شہر / علاقہ<input name="area" required></label>
        <label>قسم<select name="type"><option>گھر</option><option>دکان</option></select></label>
        <label>زیادہ سے زیادہ کرایہ<input name="rent" type="number" min="1" required></label>
        <label>زیادہ سے زیادہ ایڈوانس<input name="advance" type="number" min="0"></label>
        <label class="wide">اضافی شرائط<textarea name="notes"></textarea></label>
        <button class="primary">مطابق پراپرٹیز تلاش کریں</button>
      </form></div><div id="wantedResults" class="cards"></div></section>
    <section id="account" class="tab hidden"><div class="panel"><h2>Gmail سے لاگ اِن</h2>
      <form id="otpForm" class="grid"><label>Gmail ایڈریس<input name="email" type="email" required></label><button class="primary">Gmail پر OTP بھیجیں</button></form>
      <form id="verifyForm" class="grid hidden"><label>ای میل میں موصول ہونے والا 6 ہندسوں کا کوڈ<input name="token" inputmode="numeric" required></label><button class="primary">تصدیق کریں</button></form>
      <p id="accountStatus" class="muted">اپنا Gmail درج کریں۔</p><button id="logout" class="secondary hidden">لاگ آؤٹ</button>
    </div></section>
    <section id="admin" class="tab hidden"><div class="panel"><h2>ایڈمن کنٹرول</h2><p id="adminStatus">ایڈمن اکاؤنٹ سے لاگ اِن کریں۔</p><div id="adminListings" class="cards"></div></div></section>
    <div class="notice">پراپرٹی دیکھے اور مالک کی شناخت کی تصدیق کیے بغیر ایڈوانس نہ دیں۔</div>
  </main><footer>RENT MATCH ©</footer>`;

  document.querySelectorAll('nav button').forEach(b => b.addEventListener('click', () => tab(b.dataset.tab)));
  $('#searchForm').addEventListener('submit', e => { e.preventDefault(); loadListings(new FormData(e.target), false); });
  $('#postForm').addEventListener('submit', publish);
  $('#wantedForm').addEventListener('submit', matchWanted);
  $('#otpForm').addEventListener('submit', sendOtp);
  $('#verifyForm').addEventListener('submit', verifyOtp);
  $('#logout').addEventListener('click', logout);
  $('#nearMe').addEventListener('click', async () => { await detectLocation(true); await loadListings(); });
}
function tab(name) {
  state.tab = name;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('hidden', s.id !== name));
  if (name === 'search') loadListings();
  if (name === 'admin') loadAdmin();
}
function card(x) {
  const images = (x.photo_urls || []).map(u => `<img src="${esc(u)}" alt="پراپرٹی">`).join('');
  const phone = String(x.owner_phone || '').replace(/[^\d+]/g, '');
  const whatsapp = phone.replace(/\D/g, '');
  return `<article class="card">${images}<div class="body">
    <span class="pill">${esc(x.type)}</span><span class="pill">${esc(x.area)}</span>
    <div class="price">Rs ${Number(x.rent).toLocaleString('en-PK')} / ماہ</div>
    <div>ایڈوانس: Rs ${Number(x.advance || 0).toLocaleString('en-PK')}</div>
    <p>${esc(x.size || '')}</p><p>${esc(x.description || '')}</p>
    <div class="actions"><a class="btn primary" href="tel:${esc(phone)}">کال کریں</a>
    <a class="btn secondary" target="_blank" rel="noopener" href="https://wa.me/${esc(whatsapp)}">WhatsApp</a>
    <button class="danger" data-report="${esc(x.id)}">رپورٹ کریں</button>
    ${state.admin ? `<button class="danger" data-remove="${esc(x.id)}">اشتہار ہٹائیں</button>` : ''}</div>
  </div></article>`;
}
function render(items, target = 'results') {
  const el = $('#' + target);
  if (!el) return;
  el.innerHTML = items?.length ? items.map(card).join('') : '<div class="empty">اس وقت کوئی مناسب پراپرٹی نہیں ملی۔</div>';
  el.querySelectorAll('[data-report]').forEach(b => b.addEventListener('click', () => reportListing(b.dataset.report)));
  el.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => removeListing(b.dataset.remove)));
}
function getPosition() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => resolve(null), { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}
async function detectLocation(showMessage = false) {
  const pos = await getPosition();
  if (pos) {
    state.location = pos;
    if ($('#locationStatus')) $('#locationStatus').textContent = 'آپ کے موجودہ علاقے کے قریب پراپرٹیز دکھائی جا رہی ہیں (تقریباً 20 کلومیٹر)۔';
  } else {
    state.location = null;
    if ($('#locationStatus')) $('#locationStatus').textContent = 'لوکیشن دستیاب نہیں؛ اوپر شہر یا علاقہ لکھ کر تلاش کریں۔';
    if (showMessage) notice('لوکیشن کی اجازت نہیں ملی۔ آپ شہر یا علاقہ لکھ کر تلاش کر سکتے ہیں۔');
  }
  return pos;
}
async function loadListings(form = null, useLocation = true, target = 'results') {
  if (!supabase) { if ($('#locationStatus')) $('#locationStatus').textContent = 'Supabase سیٹنگ مکمل ہونے کے بعد پراپرٹیز لوڈ ہوں گی۔'; return; }
  let q = supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false });
  if (form) {
    const area = String(form.get('area') || '').trim();
    const type = form.get('type'), rent = form.get('rent'), advance = form.get('advance');
    if (area) q = q.ilike('area', `%${area}%`);
    if (type) q = q.eq('type', type);
    if (rent) q = q.lte('rent', Number(rent));
    if (advance) q = q.lte('advance', Number(advance));
    if (area) useLocation = false;
  }
  if (useLocation && state.location) {
    const lat = state.location.latitude, lng = state.location.longitude;
    const latDelta = 20 / 111, lngDelta = 20 / (111 * Math.max(0.2, Math.cos(lat * Math.PI / 180)));
    q = q.gte('latitude', lat - latDelta).lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta).lte('longitude', lng + lngDelta);
  }
  const { data, error } = await q;
  if (error) { notice('پراپرٹیز لوڈ نہیں ہوئیں: ' + error.message); return; }
  state.listings = data || [];
  render(state.listings, target);
}
async function sendOtp(e) {
  e.preventDefault();
  if (!supabase) return notice('Supabase URL اور anon key کی سیٹنگ درکار ہے۔');
  const email = String(new FormData(e.target).get('email') || '').trim().toLowerCase();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) return notice(error.message);
  $('#verifyForm').classList.remove('hidden');
  $('#accountStatus').textContent = 'اگر Supabase میں Email OTP فعال ہے تو آپ کے Gmail پر کوڈ بھیج دیا گیا ہے۔';
}
async function verifyOtp(e) {
  e.preventDefault();
  if (!supabase) return notice('Supabase سیٹنگ مکمل نہیں۔');
  const email = String(new FormData($('#otpForm')).get('email') || '').trim().toLowerCase();
  const token = String(new FormData(e.target).get('token') || '').trim();
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) return notice(error.message);
  state.user = data.user;
  await refreshUser();
  $('#verifyForm').classList.add('hidden');
  $('#accountStatus').textContent = 'لاگ اِن کامیاب: ' + (data.user.email || '');
}
async function refreshUser() {
  if (!supabase) return;
  const { data, error } = await supabase.auth.getUser();
  if (error) { state.user = null; return; }
  state.user = data.user;
  state.admin = false;
  if (state.user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', state.user.id).maybeSingle();
    state.admin = profile?.role === 'admin';
    if ($('#accountStatus')) $('#accountStatus').textContent = 'لاگ اِن ہیں: ' + (state.user.email || '');
    $('#logout')?.classList.remove('hidden');
  } else if ($('#accountStatus')) {
    $('#accountStatus').textContent = 'آپ لاگ اِن نہیں ہیں۔';
  }
}
async function logout() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) return notice(error.message);
  state.user = null; state.admin = false;
  $('#accountStatus').textContent = 'آپ لاگ آؤٹ ہیں۔';
  $('#logout').classList.add('hidden');
}
async function publish(e) {
  e.preventDefault();
  if (!supabase) return notice('Supabase سیٹنگ مکمل نہیں۔');
  if (!state.user) return notice('پہلے Gmail سے لاگ اِن کریں۔');
  const f = new FormData(e.target), phone = String(f.get('owner_phone') || '').trim();
  if (!phone) return notice('موبائل نمبر درج کریں۔');
  const files = f.getAll('photos').filter(file => file instanceof File && file.size);
  if (files.length > 5) return notice('زیادہ سے زیادہ 5 تصاویر اپ لوڈ کر سکتے ہیں۔');
  const photos = [];
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) return notice('ہر تصویر 5MB سے کم ہونی چاہیے۔');
    const path = `${state.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('listing-photos').upload(path, file);
    if (uploadError) return notice('تصویر اپ لوڈ نہیں ہوئی: ' + uploadError.message);
    photos.push(supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl);
  }
  const coords = state.location || await getPosition();
  const payload = {
    owner_id: state.user.id, owner_phone: phone, type: f.get('type'),
    area: String(f.get('area') || '').trim(), rent: Number(f.get('rent')),
    advance: Number(f.get('advance') || 0), size: f.get('size'),
    description: f.get('description'), photo_urls: photos, status: 'active',
    latitude: coords?.latitude ?? null, longitude: coords?.longitude ?? null
  };
  const { error } = await supabase.from('listings').insert(payload);
  if (error) return notice('اشتہار جمع نہیں ہوا: ' + error.message);
  notice('آپ کا اشتہار فوراً شائع ہو گیا ہے۔');
  e.target.reset(); tab('search'); await loadListings();
}
async function matchWanted(e) {
  e.preventDefault();
  if (!supabase) return notice('Supabase سیٹنگ مکمل نہیں۔');
  const f = new FormData(e.target), area = String(f.get('area') || '').trim();
  let q = supabase.from('listings').select('*').eq('status', 'active')
    .ilike('area', `%${area}%`).eq('type', f.get('type'))
    .lte('rent', Number(f.get('rent'))).lte('advance', Number(f.get('advance') || 999999999));
  const { data, error } = await q;
  if (error) return notice(error.message);
  render(data || [], 'wantedResults');
}
async function reportListing(id) {
  if (!supabase || !state.user) return notice('رپورٹ کرنے کے لیے پہلے لاگ اِن کریں۔');
  const reason = prompt('رپورٹ کی وجہ لکھیں:');
  if (!reason?.trim()) return;
  const { error } = await supabase.from('listing_reports').insert({
    listing_id: id, reporter_id: state.user.id, reason: reason.trim()
  });
  if (error) return notice('رپورٹ جمع نہیں ہوئی: ' + error.message);
  notice('آپ کی رپورٹ موصول ہو گئی ہے۔');
}
async function loadAdmin() {
  if (!supabase || !state.user) { $('#adminStatus').textContent = 'ایڈمن دیکھنے کے لیے لاگ اِن کریں۔'; return; }
  await refreshUser();
  if (!state.admin) { $('#adminStatus').textContent = 'یہ حصہ صرف ایڈمن کے لیے ہے۔'; return; }
  $('#adminStatus').textContent = 'ایڈمن موڈ فعال ہے۔';
  const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
  if (error) return notice(error.message);
  render(data || [], 'adminListings');
}
async function removeListing(id) {
  if (!state.admin) return notice('صرف ایڈمن اشتہار ہٹا سکتا ہے۔');
  if (!confirm('کیا آپ واقعی یہ اشتہار ہٹانا چاہتے ہیں؟')) return;
  const { error } = await supabase.from('listings').update({ status: 'removed' }).eq('id', id);
  if (error) return notice(error.message);
  notice('اشتہار ہٹا دیا گیا۔'); await loadAdmin();
}
async function start() {
  shell();
  if (!supabase) {
    $('#accountStatus').textContent = 'ایپ چل رہی ہے، لیکن Supabase کی سیٹنگ ابھی درکار ہے۔';
    $('#locationStatus').textContent = 'Supabase سیٹنگ مکمل ہونے کے بعد تلاش شروع ہوگی۔';
    return;
  }
  await refreshUser();
  await detectLocation();
  await loadListings();
  supabase.auth.onAuthStateChange(() => { refreshUser(); });
}
start().catch(error => {
  console.error('RENT MATCH startup error:', error);
  if ($('#app')) $('#app').innerHTML = '<div class="panel">ایپ شروع نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔</div>';
});
