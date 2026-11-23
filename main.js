import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && anon ? createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;

const $ = (s) => document.querySelector(s);
const state = { user: null, listings: [], tab: 'search', admin: false, location: null, myListings: false, notificationChannel: null };

const translations = {
  'صحیح پراپرٹی، صحیح کرایہ دار — آسانی سے':'The right property, the right tenant — made easy',
  'پراپرٹی تلاش کریں':'Find Property','اشتہار لگائیں':'Post Listing','ضرورت درج کریں':'Post Requirement',
  'میرے اشتہارات':'My Listings','اطلاعات':'Notifications','اکاؤنٹ':'Account','ایڈمن':'Admin',
  'گھر یا دکان تلاش کریں':'Find a house or shop','شہر / علاقہ':'City / Area',
  'قسم':'Type','دونوں':'Both','گھر':'House','دکان':'Shop',
  'زیادہ سے زیادہ کرایہ':'Maximum Rent','زیادہ سے زیادہ ایڈوانس':'Maximum Advance',
  'تلاش کریں':'Search','میری موجودہ لوکیشن':'My Current Location',
  'پراپرٹی کا اشتہار لگائیں':'Post a Property Listing','ماہانہ کرایہ':'Monthly Rent',
  'ایڈوانس':'Advance','سائز / کمرے':'Size / Rooms','رابطہ موبائل نمبر':'Contact Mobile Number',
  'تصاویر (زیادہ سے زیادہ 5)':'Photos (up to 5)','تفصیل':'Description',
  'اشتہار شائع کریں':'Publish Listing','یہ پراپرٹی میری موجودہ لوکیشن پر ہے':'This property is at my current location',
  'اپنی ضرورت درج کریں':'Post Your Requirement','اضافی شرائط':'Additional Requirements',
  'مطابق پراپرٹیز تلاش کریں':'Find Matching Properties',
  'یہاں آپ اپنے لگائے ہوئے اشتہارات دیکھ اور ختم کر سکتے ہیں۔':'View and remove your own listings here.',
  'اکاؤنٹ میں لاگ اِن':'Sign in to Your Account',
  'بغیر OTP کے اپنے اکاؤنٹ سے محفوظ طریقے سے لاگ اِن کریں۔':'Sign in securely without an OTP.',
  'Google / Gmail سے لاگ اِن کریں':'Continue with Google / Gmail',
  'Facebook سے لاگ اِن کریں':'Continue with Facebook',
  'لاگ اِن کرنے کے لیے ایک آپشن منتخب کریں۔':'Choose a sign-in option.',
  'ایڈمن کنٹرول':'Admin Control','ایڈمن اکاؤنٹ سے لاگ اِن کریں۔':'Sign in with an admin account.',
  'پراپرٹی دیکھے اور مالک کی شناخت کی تصدیق کیے بغیر ایڈوانس نہ دیں۔':'Do not pay an advance before viewing the property and verifying the owner.',
  'RENT MATCH ©':'RENT MATCH ©','کال کریں':'Call','رپورٹ کریں':'Report',
  'اشتہار ہٹائیں':'Remove Listing','میرا اشتہار ختم کریں':'Remove My Listing',
  'WhatsApp':'WhatsApp','اس وقت کوئی مناسب پراپرٹی نہیں ملی۔':'No matching properties found.',
  'لاگ آؤٹ':'Log out'
};
function applyLanguage(lang) {
  const english = lang === 'en';
  document.documentElement.lang = english ? 'en' : 'ur';
  document.documentElement.dir = english ? 'ltr' : 'rtl';
  const walker = document.createTreeWalker(document.querySelector('#app'), NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const original = node.nodeValue.trim();
    if (!original) continue;
    if (english && translations[original]) node.nodeValue = node.nodeValue.replace(original, translations[original]);
    else if (!english) {
      const reverse = Object.entries(translations).find(([, value]) => value === original);
      if (reverse) node.nodeValue = node.nodeValue.replace(original, reverse[0]);
    }
  }
  document.querySelectorAll('#app input[placeholder], #app textarea[placeholder]').forEach(el => {
    if (english && el.placeholder === 'مثلاً خوشاب، جوہرآباد') el.placeholder = 'e.g. Khushab, Jauharabad';
    else if (!english && el.placeholder === 'e.g. Khushab, Jauharabad') el.placeholder = 'مثلاً خوشاب، جوہرآباد';
  });
  localStorage.setItem('rent-match-language', lang);
}


function notice(message) { alert(message); }
function esc(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function shell() {
  $('#app').innerHTML = `
  <header><div class="wrap"><div class="brand-row"><div class="brand">🏠 RENT MATCH</div><label class="language-label">زبان / Language<select id="languageSelect" aria-label="Language"><option value="ur">اردو</option><option value="en">English</option></select></label></div>
    <p>صحیح پراپرٹی، صحیح کرایہ دار — آسانی سے</p>
    <nav>
      <button data-tab="search" class="active">پراپرٹی تلاش کریں</button>
      <button data-tab="post">اشتہار لگائیں</button>
      <button data-tab="wanted">ضرورت درج کریں</button>
      <button data-tab="mine">میرے اشتہارات</button>
      <button data-tab="notifications">اطلاعات <span id="notificationCount" class="notification-count hidden">0</span></button>
      <button data-tab="account">اکاؤنٹ</button>
      <button data-tab="admin">ایڈمن</button>
    </nav></div></header>
  <main class="wrap">
    <section id="search" class="tab">
      <div class="search-intro">
        <span class="eyebrow">RENT MATCH</span>
        <h1>گھر یا دکان تلاش کریں</h1>
        <p>اپنی ضرورت کے مطابق پراپرٹی تلاش کرنے کے لیے یہاں کلک کریں۔</p>
        <button id="openPropertySearch" class="primary" type="button">گھر یا دکان تلاش کریں</button>
      </div>
      <div id="propertySearchPanel" class="panel search-panel hidden">
      <p id="locationStatus" class="muted">آپ کے علاقے کی پراپرٹیز تلاش کی جا رہی ہیں…</p>
      <form id="searchForm" class="grid">
        <label>شہر / علاقہ<input name="area" placeholder="مثلاً خوشاب، جوہرآباد"></label>
        <label>قسم<select name="type"><option value="">دونوں</option><option>گھر</option><option>دکان</option></select></label>
        <label>زیادہ سے زیادہ کرایہ<input name="rent" type="number" min="0"></label>
        <label>زیادہ سے زیادہ ایڈوانس<input name="advance" type="number" min="0"></label>
        <button class="primary">تلاش کریں</button>
        <button type="button" id="nearMe" class="secondary">میری موجودہ لوکیشن</button>
      </form>
      </div>
      <div class="results-heading"><h2>دستیاب پراپرٹیز</h2><span>تفصیل دیکھنے کے لیے کارڈ کھولیں</span></div>
      <div id="results" class="cards"></div>
    </section>
    <section id="post" class="tab hidden"><div class="panel"><h2>پراپرٹی کا اشتہار لگائیں</h2>
      <form id="postForm" class="grid">
        <label>قسم<select name="type"><option>گھر</option><option>دکان</option></select></label>
        <label>شہر / علاقہ<input name="area" required></label>
        <label>ماہانہ کرایہ<input name="rent" type="number" min="1" required></label>
        <label>ایڈوانس<input name="advance" type="number" min="0" value="0"></label>
        <label>سائز / کمرے<input name="size" placeholder="5 مرلہ، 2 کمرے"></label>
        <label>رابطہ موبائل نمبر<input name="owner_phone" type="tel" required></label>
        <label>تصاویر یا ویڈیوز (زیادہ سے زیادہ 5)<input name="photos" type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple></label>
        <label class="wide"><span><input name="use_current_location" type="checkbox" style="display:inline;width:auto"> یہ پراپرٹی میری موجودہ لوکیشن پر ہے</span></label>
        <label class="wide">تفصیل<textarea name="description"></textarea></label>
        <button class="primary">اشتہار شائع کریں</button>
      </form><p class="muted">اشتہار لگانے کے لیے پہلے Google یا Facebook سے لاگ اِن کریں۔ اشتہار جمع ہوتے ہی شائع ہوگا۔</p>
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
    <section id="mine" class="tab hidden"><div class="panel"><h2>میرے اشتہارات</h2><p class="muted">یہاں آپ اپنے لگائے ہوئے اشتہارات دیکھ اور ختم کر سکتے ہیں۔</p></div><div id="myListings" class="cards"></div></section>
    <section id="notifications" class="tab hidden"><div class="panel"><h2>اطلاعات</h2><p class="muted">آپ کے اشتہارات پر آنے والے نئے کمنٹس کی اطلاع یہاں ملے گی۔</p><div id="notificationsList"></div></div></section>
    <section id="account" class="tab hidden"><div class="panel"><h2>اکاؤنٹ میں لاگ اِن</h2>
      <p>بغیر OTP کے اپنے اکاؤنٹ سے محفوظ طریقے سے لاگ اِن کریں۔</p>
      <div class="grid">
        <button id="googleLogin" class="primary" type="button">Google / Gmail سے لاگ اِن کریں</button>
        <button id="facebookLogin" class="secondary" type="button">Facebook سے لاگ اِن کریں</button>
      </div>
      <p id="accountStatus" class="muted">لاگ اِن کرنے کے لیے ایک آپشن منتخب کریں۔</p><button id="logout" class="secondary hidden">لاگ آؤٹ</button>
    </div></section>
    <section id="admin" class="tab hidden"><div class="panel"><h2>ایڈمن کنٹرول</h2><p id="adminStatus">ایڈمن اکاؤنٹ سے لاگ اِن کریں۔</p><div id="adminListings" class="cards"></div></div></section>
    <div class="notice">پراپرٹی دیکھے اور مالک کی شناخت کی تصدیق کیے بغیر ایڈوانس نہ دیں۔</div>
  </main><div id="mediaViewer" class="media-viewer hidden" role="dialog" aria-modal="true" aria-label="Media viewer"><button type="button" class="media-viewer-close" aria-label="Close">×</button><div id="mediaViewerContent" class="media-viewer-content"></div></div><footer>RENT MATCH ©</footer>`;

  const languageSelect = $('#languageSelect');
  if (languageSelect) {
    languageSelect.value = localStorage.getItem('rent-match-language') || 'ur';
    languageSelect.addEventListener('change', e => applyLanguage(e.target.value));
    applyLanguage(languageSelect.value);
  }
  document.querySelectorAll('nav button').forEach(b => b.addEventListener('click', () => tab(b.dataset.tab)));
  $('#mediaViewer').addEventListener('click', e => { if (e.target.id === 'mediaViewer' || e.target.closest('.media-viewer-close')) closeMedia(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMedia(); });
  $('#openPropertySearch').addEventListener('click', () => {
    $('#propertySearchPanel').classList.remove('hidden');
    $('#openPropertySearch').classList.add('hidden');
    $('#propertySearchPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#searchForm').addEventListener('submit', e => { e.preventDefault(); loadListings(new FormData(e.target), true); });
  $('#postForm').addEventListener('submit', publish);
  $('#wantedForm').addEventListener('submit', matchWanted);
  $('#googleLogin').addEventListener('click', () => loginWithProvider('google'));
  $('#facebookLogin').addEventListener('click', () => loginWithProvider('facebook'));
  $('#logout').addEventListener('click', logout);
  $('#nearMe').addEventListener('click', async () => { await detectLocation(true); await loadListings(); });
}
function tab(name) {
  state.tab = name;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('hidden', s.id !== name));
  if (name === 'search') loadListings();
  if (name === 'admin') loadAdmin();
  if (name === 'mine') loadMyListings();
  if (name === 'notifications') loadNotifications();
}
function isVideoMedia(url) { return /\.(mp4|webm|mov)(\?|$)/i.test(String(url || '')); }
function mediaButton(url, index, cover = false) {
  const video = isVideoMedia(url);
  const preview = video ? `<video class="${cover ? 'property-cover' : 'extra-media'}" src="${esc(url)}#t=0.1" muted playsinline preload="metadata"></video><span class="media-play-icon">▶</span>` : `<img class="${cover ? 'property-cover' : 'extra-media'}" src="${esc(url)}" alt="پراپرٹی کی تصویر" loading="lazy">`;
  return `<button type="button" class="media-open ${cover ? 'media-open-cover' : ''}" data-open-media="${esc(url)}" data-media-type="${video ? 'video' : 'image'}" aria-label="میڈیا کھولیں">${preview}</button>`;
}
function card(x) {
  const photos = Array.isArray(x.photo_urls) ? x.photo_urls : [];
  const cover = photos[0] ? mediaButton(photos[0], 0, true) : '<div class="property-placeholder">🏠<span>تصویر دستیاب نہیں</span></div>';
  const videoCount = photos.filter(isVideoMedia).length;
  const phone = String(x.owner_phone || '').replace(/[^\\d+]/g, '');
  let whatsapp = phone.replace(/\\D/g, '');
  if (whatsapp.startsWith('00')) whatsapp = whatsapp.slice(2);
  if (whatsapp.startsWith('0')) whatsapp = '92' + whatsapp.slice(1);
  else if (whatsapp.startsWith('3') && whatsapp.length === 10) whatsapp = '92' + whatsapp;
  return `<article class="card property-card">
    <div class="property-media">${cover}${photos.length > 1 ? `<span class="photo-count">📷 ${photos.length} میڈیا${videoCount ? ` · ${videoCount} ویڈیو` : ''}</span>` : ''}</div>
    <div class="body">
      <div class="property-tags"><span class="pill">${esc(x.type)}</span><span class="pill">📍 ${esc(x.area)}</span></div>
      <div class="price">Rs ${Number(x.rent).toLocaleString('en-PK')} <small>/ ماہ</small></div>
      <div class="property-summary">${esc(x.size || 'مزید تفصیل کے لیے کلک کریں')}</div>
      <button class="primary details-toggle" type="button" data-details="${esc(x.id)}" aria-expanded="false">تفصیل دیکھیں ↓</button>
      <div class="property-details hidden" id="details-${esc(x.id)}">
        <div class="detail-line"><strong>ایڈوانس:</strong> Rs ${Number(x.advance || 0).toLocaleString('en-PK')}</div>
        ${x.description ? `<p>${esc(x.description)}</p>` : ''}
        ${photos.length > 1 ? `<div class="extra-photos">${photos.slice(1).map((u, i) => mediaButton(u, i + 1)).join('')}</div>` : ''}
        <div class="actions">
          <a class="btn primary" href="tel:${esc(phone)}">کال کریں</a>
          <a class="btn secondary" target="_blank" rel="noopener" href="https://wa.me/${esc(whatsapp)}">WhatsApp</a>
          ${x.owner_id !== state.user?.id ? `<button class="danger" data-report="${esc(x.id)}">رپورٹ کریں</button>` : ''}
          ${state.admin ? `<button class="danger" data-remove="${esc(x.id)}">اشتہار ہٹائیں</button>` : ''}
          ${state.myListings && x.status === 'active' ? `<button class="danger" data-own-remove="${esc(x.id)}">میرا اشتہار ختم کریں</button>` : ''}
        </div>
        <section class="comments-section" aria-label="Comments">
          <h3>تبصرے / Comments</h3>
          <div class="comments-list" id="comments-${esc(x.id)}"><p class="muted">کمنٹس لوڈ ہو رہے ہیں…</p></div>
          ${state.user ? `<form class="comment-form" data-comment-form="${esc(x.id)}"><textarea name="body" maxlength="1000" required placeholder="اپنا کمنٹ لکھیں…"></textarea><button class="primary" type="submit">کمنٹ بھیجیں</button></form>` : `<p class="muted">کمنٹ کرنے کے لیے اکاؤنٹ میں لاگ اِن کریں۔</p>`}
        </section>
      </div>
    </div>
  </article>`;
}
function render(items, target = 'results') {
  const el = $('#' + target);
  if (!el) return;
  el.innerHTML = items?.length ? items.map(card).join('') : '<div class="empty">اس وقت کوئی مناسب پراپرٹی نہیں ملی۔</div>';
  el.querySelectorAll('[data-open-media]').forEach(b => b.addEventListener('click', () => openMedia(b.dataset.openMedia, b.dataset.mediaType)));
  el.querySelectorAll('[data-details]').forEach(b => b.addEventListener('click', () => {
    const panel = document.getElementById('details-' + b.dataset.details);
    if (!panel) return;
    const opening = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !opening);
    b.setAttribute('aria-expanded', String(opening));
    b.textContent = opening ? 'تفصیل چھپائیں ↑' : 'تفصیل دیکھیں ↓';
    if (opening) loadComments(b.dataset.details);
  }));
  el.querySelectorAll('[data-report]').forEach(b => b.addEventListener('click', () => reportListing(b.dataset.report)));
  el.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => removeListing(b.dataset.remove)));
  el.querySelectorAll('[data-own-remove]').forEach(b => b.addEventListener('click', () => archiveOwnListing(b.dataset.ownRemove)));
  el.querySelectorAll('[data-comment-form]').forEach(form => form.addEventListener('submit', e => submitComment(e, form.dataset.commentForm)));
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
    if (area) {
      useLocation = false;
      if ($('#locationStatus')) $('#locationStatus').textContent = `آپ کے منتخب کردہ علاقے: ${area} کی پراپرٹیز دکھائی جا رہی ہیں۔`;
    }
  }
  if (useLocation && !state.location) {
    if ($('#locationStatus')) $('#locationStatus').textContent = 'آپ کی لوکیشن دستیاب نہیں؛ کسی شہر یا علاقے کا نام لکھ کر تلاش کریں۔';
    render([], target);
    return;
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
async function loginWithProvider(provider) {
  if (!supabase) return notice('Supabase سیٹنگ مکمل نہیں۔');
  if ($('#accountStatus')) $('#accountStatus').textContent = 'آپ کو محفوظ لاگ اِن صفحے پر بھیجا جا رہا ہے…';
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin }
  });
  if (error) {
    if ($('#accountStatus')) $('#accountStatus').textContent = 'لاگ اِن شروع نہیں ہو سکا۔';
    return notice(error.message);
  }
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
    subscribeOwnerNotifications();
  } else {
    if (state.notificationChannel) { supabase.removeChannel(state.notificationChannel); state.notificationChannel = null; }
    updateNotificationBadge(0);
    if ($('#accountStatus')) $('#accountStatus').textContent = 'آپ لاگ اِن نہیں ہیں۔';
  }
}
async function logout() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) return notice(error.message);
  state.user = null; state.admin = false;
  if (state.notificationChannel) { supabase.removeChannel(state.notificationChannel); state.notificationChannel = null; }
  updateNotificationBadge(0);
  $('#accountStatus').textContent = 'آپ لاگ آؤٹ ہیں۔';
  $('#logout').classList.add('hidden');
}
async function publish(e) {
  e.preventDefault();
  if (!supabase) return notice('Supabase سیٹنگ مکمل نہیں۔');
  if (!state.user) return notice('پہلے Google یا Facebook سے لاگ اِن کریں۔');
  const f = new FormData(e.target), phone = String(f.get('owner_phone') || '').trim();
  if (!phone) return notice('موبائل نمبر درج کریں۔');
  const files = f.getAll('photos').filter(file => file instanceof File && file.size);
  if (files.length > 5) return notice('زیادہ سے زیادہ 5 تصاویر یا ویڈیوز اپ لوڈ کر سکتے ہیں۔');
  const photos = [];
  for (const file of files) {
    const isVideo = file.type.startsWith('video/');
    if (!file.type.startsWith('image/') && !isVideo) return notice('صرف تصویر یا ویڈیو فائل اپ لوڈ کریں۔');
    if (isVideo && file.size > 25 * 1024 * 1024) return notice('ہر ویڈیو 25MB سے کم ہونی چاہیے۔');
    if (!isVideo && file.size > 5 * 1024 * 1024) return notice('ہر تصویر 5MB سے کم ہونی چاہیے۔');
    const path = `${state.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('listing-photos').upload(path, file);
    if (uploadError) return notice('تصویر اپ لوڈ نہیں ہوئی: ' + uploadError.message);
    photos.push(supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl);
  }
  const coords = f.get("use_current_location") === "on" ? (state.location || await getPosition()) : null;
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
function openMedia(url, type) {
  const viewer = $('#mediaViewer'), content = $('#mediaViewerContent');
  if (!viewer || !content) return;
  content.innerHTML = type === 'video' ? `<video src="${esc(url)}" controls autoplay playsinline></video>` : `<img src="${esc(url)}" alt="پراپرٹی کی بڑی تصویر">`;
  viewer.classList.remove('hidden');
  document.body.classList.add('media-viewer-open');
}
function closeMedia() {
  const viewer = $('#mediaViewer'), content = $('#mediaViewerContent');
  if (!viewer || !content) return;
  content.querySelector('video')?.pause();
  content.innerHTML = '';
  viewer.classList.add('hidden');
  document.body.classList.remove('media-viewer-open');
}
async function loadComments(listingId) {
  const target = document.getElementById('comments-' + listingId);
  if (!target || !supabase) return;
  const { data, error } = await supabase.from('listing_comments').select('id, author_name, body, created_at').eq('listing_id', listingId).order('created_at', { ascending: true });
  if (error) { target.innerHTML = '<p class="muted">کمنٹس لوڈ نہیں ہو سکے۔</p>'; return; }
  target.innerHTML = data && data.length ? data.map(c => '<article class="comment-item"><strong>' + esc(c.author_name) + '</strong><p>' + esc(c.body) + '</p><time>' + new Date(c.created_at).toLocaleString('ur-PK') + '</time></article>').join('') : '<p class="muted">ابھی کوئی کمنٹ نہیں۔ پہلا کمنٹ کریں۔</p>';
}
async function submitComment(event, listingId) {
  event.preventDefault();
  if (!state.user) return notice('کمنٹ کرنے کے لیے پہلے لاگ اِن کریں۔');
  const form = event.currentTarget;
  const body = String(new FormData(form).get('body') || '').trim();
  if (!body) return;
  const authorName = state.user.user_metadata?.full_name || state.user.user_metadata?.name || 'صارف';
  const button = form.querySelector('button[type="submit"]'); button.disabled = true;
  const { error } = await supabase.from('listing_comments').insert({ listing_id: listingId, author_id: state.user.id, author_name: authorName, body });
  button.disabled = false;
  if (error) return notice('کمنٹ بھیجا نہیں جا سکا: ' + error.message);
  form.reset(); await loadComments(listingId);
}
function updateNotificationBadge(count) {
  const badge = $('#notificationCount'); if (!badge) return;
  badge.textContent = String(count); badge.classList.toggle('hidden', !count);
}
async function loadNotifications() {
  const target = $('#notificationsList'); if (!target) return;
  if (!state.user) { target.innerHTML = '<p class="muted">اطلاعات دیکھنے کے لیے لاگ اِن کریں۔</p>'; updateNotificationBadge(0); return; }
  const { data, error } = await supabase.from('notifications').select('id, message, is_read, created_at').eq('recipient_id', state.user.id).order('created_at', { ascending: false }).limit(50);
  if (error) { target.innerHTML = '<p class="muted">اطلاعات لوڈ نہیں ہو سکیں۔</p>'; return; }
  updateNotificationBadge((data || []).filter(n => !n.is_read).length);
  target.innerHTML = data && data.length ? data.map(n => '<button class="notification-item ' + (n.is_read ? '' : 'unread') + '" type="button" data-notification-id="' + esc(n.id) + '"><span>' + esc(n.message) + '</span><time>' + new Date(n.created_at).toLocaleString('ur-PK') + '</time></button>').join('') : '<p class="muted">ابھی کوئی نئی اطلاع نہیں۔</p>';
  target.querySelectorAll('[data-notification-id]').forEach(button => button.addEventListener('click', async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', button.dataset.notificationId).eq('recipient_id', state.user.id);
    button.classList.remove('unread'); updateNotificationBadge(target.querySelectorAll('.notification-item.unread').length);
  }));
}
function subscribeOwnerNotifications() {
  if (!supabase || !state.user) return;
  if (state.notificationChannel) supabase.removeChannel(state.notificationChannel);
  const ownerId = state.user.id;
  state.notificationChannel = supabase.channel('owner-notifications-' + ownerId).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'recipient_id=eq.' + ownerId }, () => {
    loadNotifications(); if (state.tab !== 'notifications') notice('آپ کے پراپرٹی اشتہار پر نیا کمنٹ آیا ہے۔');
  }).subscribe();
  loadNotifications();
}

async function loadMyListings() {
  if (!supabase || !state.user) {
    $('#myListings').innerHTML = '<div class="empty">اپنے اشتہارات دیکھنے کے لیے پہلے اکاؤنٹ میں لاگ اِن کریں۔</div>';
    return;
  }
  await refreshUser();
  const { data, error } = await supabase.from('listings').select('*')
    .eq('owner_id', state.user.id).order('created_at', { ascending: false });
  if (error) return notice('آپ کے اشتہارات لوڈ نہیں ہوئے: ' + error.message);
  state.myListings = true;
  render(data || [], 'myListings');
  state.myListings = false;
}
async function archiveOwnListing(id) {
  if (!state.user) return notice('پہلے لاگ اِن کریں۔');
  if (!confirm('کیا آپ یہ اشتہار ختم کرنا چاہتے ہیں؟ یہ عام تلاش میں نظر نہیں آئے گا۔')) return;
  const { error } = await supabase.from('listings').update({ status: 'removed' })
    .eq('id', id).eq('owner_id', state.user.id);
  if (error) return notice('اشتہار ختم نہیں ہوا: ' + error.message);
  notice('آپ کا اشتہار ختم کر دیا گیا ہے۔');
  await loadMyListings();
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
