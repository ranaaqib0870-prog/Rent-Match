import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && anon ? createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;

const $ = (s) => document.querySelector(s);
const state = { user: null, listings: [], tab: 'search', admin: false, location: null, myListings: false, notificationChannel: null, agentProfiles: {} };

const translations = {
  'صحیح پراپرٹی، صحیح کرایہ دار — آسانی سے':'The right property, the right tenant — made easy',
  'پراپرٹی تلاش کریں':'Find Property','اشتہار لگائیں':'Post Listing','ضرورت درج کریں':'Post Requirement',
  'میرے اشتہارات':'My Listings','اطلاعات':'Notifications','اکاؤنٹ':'Account','ایڈمن':'Admin',
  'گھر یا دکان تلاش کریں':'Find a house or shop','شہر / علاقہ':'City / Area','قسم':'Type','دونوں':'Both','گھر':'House','دکان':'Shop',
  'زیادہ سے زیادہ کرایہ':'Maximum Rent','زیادہ سے زیادہ ایڈوانس':'Maximum Advance','تلاش کریں':'Search','میری موجودہ لوکیشن':'My Current Location',
  'پراپرٹی کا اشتہار لگائیں':'Post a Property Listing','ماہانہ کرایہ':'Monthly Rent','ایڈوانس':'Advance','سائز / کمرے':'Size / Rooms',
  'رابطہ موبائل نمبر':'Contact Mobile Number','تصاویر (زیادہ سے زیادہ 5)':'Photos (up to 5)','تصاویر یا ویڈیوز (زیادہ سے زیادہ 5)':'Photos or Videos (up to 5)',
  'تفصیل':'Description','اشتہار شائع کریں':'Publish Listing','یہ پراپرٹی میری موجودہ لوکیشن پر ہے':'This property is at my current location',
  'اپنی ضرورت درج کریں':'Post Your Requirement','اضافی شرائط':'Additional Requirements','مطابق پراپرٹیز تلاش کریں':'Find Matching Properties',
  'یہاں آپ اپنے لگائے ہوئے اشتہارات دیکھ اور ختم کر سکتے ہیں۔':'View and manage your own listings here.',
  'اکاؤنٹ میں لاگ اِن':'Sign in to Your Account','بغیر OTP کے اپنے اکاؤنٹ سے محفوظ طریقے سے لاگ اِن کریں۔':'Sign in securely without an OTP.',
  'Google / Gmail سے لاگ اِن کریں':'Continue with Google / Gmail','Facebook سے لاگ اِن کریں':'Continue with Facebook',
  'لاگ اِن کرنے کے لیے ایک آپشن منتخب کریں۔':'Choose a sign-in option.','ایڈمن کنٹرول':'Admin Control',
  'ایڈمن اکاؤنٹ سے لاگ اِن کریں۔':'Sign in with an admin account.',
  'پراپرٹی دیکھے اور مالک کی شناخت کی تصدیق کیے بغیر ایڈوانس نہ دیں۔':'Do not pay an advance before viewing the property and verifying the owner.',
  'کال کریں':'Call','رپورٹ کریں':'Report','اشتہار ہٹائیں':'Remove Listing','میرا اشتہار ختم کریں':'Remove My Listing',
  'اس وقت کوئی مناسب پراپرٹی نہیں ملی۔':'No matching properties found.','لاگ آؤٹ':'Log out',
  'زبان / Language':'Language','اپنی ضرورت کے مطابق پراپرٹی تلاش کرنے کے لیے یہاں کلک کریں۔':'Click here to find a property that matches your needs.',
  'اپنے اشتہار کو نمایاں کریں اور جلد کرایہ دار پائیں':'Promote Your Listing and Find a Tenant Faster',
  'عام پراپرٹی اشتہار ہمیشہ مفت رہے گا۔ اضافی رسائی کے لیے اختیاری paid سہولیات پیش کی جائیں گی.':'Basic property listings will always be free. Optional paid features will provide extra visibility.',
  'نمایاں پراپرٹی اشتہار':'Featured Property Listing','اشتہار عام لسٹنگ سے اوپر نمایاں ڈیزائن کے ساتھ دکھایا جائے گا۔':'Your listing will appear above regular listings with a highlighted design.',
  'پراپرٹی ڈیلر پیکج':'Property Agent Packages','ڈیلرز اور ایجنٹس کے لیے الگ پیکجز، زیادہ اشتہارات اور کاروباری پروفائل۔':'Dedicated plans for property dealers and agents, with multiple listings and a business profile.','اسٹارٹر ایجنٹ — 7 دن — Rs 500':'Starter Agent — 7 days — Rs 500','پروفیشنل ایجنٹ — 15 دن — Rs 900':'Professional Agent — 15 days — Rs 900','بزنس ایجنٹ — 30 دن — Rs 1,500':'Business Agent — 30 days — Rs 1,500','40 فعال اشتہارات تک':'Up to 40 active listings','الگ ایجنٹ پروفائل اور Verified Agent بیج':'Separate agent profile and Verified Agent badge','تمام اشتہارات ایک جگہ مینیج کریں':'Manage all listings in one place','پروفائل پر کاروباری رابطہ نمبر':'Business contact details on your profile','ایجنٹ پیکجز کی ادائیگی جلد فعال ہوگی۔':'Select an agent plan and submit payment for admin verification.',
  'اشتہار لگانے کے لیے پہلے Google یا Facebook سے لاگ اِن کریں۔':'Sign in with Google or Facebook to post a listing.',
  'آپ کا اگلا اشتہار لگانے کا حق دستیاب ہے۔':'Your next listing is available now.',
  'آپ کا Premium فعال ہے؛ آپ اضافی اشتہارات لگا سکتے ہیں۔':'Your Premium plan is active; you can post additional listings.',
  'آپ کا مفت اشتہار استعمال ہو چکا ہے۔ اگلا مفت اشتہار ':'Your free listing has been used. Your next free listing is available on ',
  'اشتہار لگانے کا اسٹیٹس چیک کیا جا رہا ہے…':'Checking your listing eligibility…',
  'مجوزہ قیمت: Rs 2,000 / ماہ':'Suggested price: Rs 2,000 / month','کاروباری بینر اشتہارات':'Business Banner Ads',
  'بلڈرز، فرنیچر شاپس، شفٹنگ سروسز اور مقامی کاروبار کے بینر اشتہارات۔':'Banner ads for builders, furniture stores, moving services, and local businesses.',
  'ہفتہ وار یا ماہانہ فیس':'Weekly or monthly fee',
  'عام صارف ہر 10 دن میں ایک مفت اشتہار لگا سکتا ہے۔ اضافی اشتہارات کے لیے Premium پیکج دستیاب ہوگا۔':'A regular user can post one free listing every 10 days. Premium plans allow additional listings.',
  'مفت اشتہار کی حد پوری ہو چکی ہے۔ اگلا مفت اشتہار 10 دن بعد لگا سکیں گے۔ اضافی اشتہار کے لیے Premium پیکج منتخب کریں۔':'You have used your free listing. You can post another free listing after 10 days, or choose a Premium plan for additional listings.',
  'نوٹ: پریمیم اور ایجنٹ پیکج کی ادائیگی اسکرین شاٹ اور ایڈمن کی تصدیق کے بعد فعال ہوگی۔ خودکار آن لائن گیٹ وے اور نمایاں اشتہار ابھی فعال نہیں ہیں۔':'Premium and Agent packages activate after screenshot submission and admin verification. Automatic online payments and promoted listings are not active yet.',
  'دستیاب پراپرٹیز':'Available Properties','تفصیل دیکھنے کے لیے کارڈ کھولیں':'Open a card to view details',
  'آپ کے علاقے کی پراپرٹیز تلاش کی جا رہی ہیں…':'Finding properties in your area…','5 مرلہ، 2 کمرے':'5 marla, 2 rooms',
  'اشتہار لگانے کے لیے پہلے Google یا Facebook سے لاگ اِن کریں۔ اشتہار جمع ہوتے ہی شائع ہوگا۔':'Sign in with Google or Facebook to post a listing. Your listing will be published as soon as you submit it.',
  'آپ کے اشتہارات پر آنے والے نئے کمنٹس کی اطلاع یہاں ملے گی۔':'Notifications about new comments on your listings will appear here.',
  'میڈیا کھولیں':'Open media','تصویر دستیاب نہیں':'No image available','مزید تفصیل کے لیے کلک کریں':'Click for more details',
  'تفصیل دیکھیں ↓':'View Details ↓','تفصیل چھپائیں ↑':'Hide Details ↑','تبصرے / Comments':'Comments',
  'کمنٹس لوڈ ہو رہے ہیں…':'Loading comments…','اپنا کمنٹ لکھیں…':'Write your comment…','کمنٹ بھیجیں':'Post Comment',
  'کمنٹ کرنے کے لیے اکاؤنٹ میں لاگ اِن کریں۔':'Sign in to your account to comment.',
  'لوکیشن کی اجازت نہیں ملی۔ آپ شہر یا علاقہ لکھ کر تلاش کر سکتے ہیں۔':'Location permission was not granted. You can search by entering a city or area.',
  'Supabase سیٹنگ مکمل ہونے کے بعد پراپرٹیز لوڈ ہوں گی۔':'Properties will load once the Supabase setup is complete.',
  'لوکیشن دستیاب نہیں؛ اوپر شہر یا علاقہ لکھ کر تلاش کریں۔':'Location unavailable. Enter a city or area above to search.',
  'آپ کی لوکیشن دستیاب نہیں؛ کسی شہر یا علاقے کا نام لکھ کر تلاش کریں۔':'Your location is unavailable. Enter a city or area to search.',
  'پراپرٹیز لوڈ نہیں ہوئیں: ':'Could not load properties: ','Supabase سیٹنگ مکمل نہیں۔':'Supabase setup is incomplete.',
  'آپ کو محفوظ لاگ اِن صفحے پر بھیجا جا رہا ہے…':'Redirecting you to the secure sign-in page…',
  'لاگ اِن شروع نہیں ہو سکا۔':'Could not start sign-in.','آپ لاگ اِن نہیں ہیں۔':'You are not signed in.',
  'آپ لاگ آؤٹ ہیں۔':'You are logged out.','پہلے Google یا Facebook سے لاگ اِن کریں۔':'Please sign in with Google or Facebook first.',
  'موبائل نمبر درج کریں۔':'Please enter a mobile number.','زیادہ سے زیادہ 5 تصاویر یا ویڈیوز اپ لوڈ کر سکتے ہیں。':'You can upload up to 5 photos or videos.',
  'صرف تصویر یا ویڈیو فائل اپ لوڈ کریں۔':'Please upload image or video files only.','ہر ویڈیو 25MB سے کم ہونی چاہیے۔':'Each video must be smaller than 25 MB.',
  'ہر تصویر 5MB سے کم ہونی چاہیے۔':'Each photo must be smaller than 5 MB.','تصویر اپ لوڈ نہیں ہوئی: ':'Could not upload image: ',
  'اشتہار جمع نہیں ہوا: ':'Could not submit listing: ','آپ کا اشتہار فوراً شائع ہو گیا ہے۔':'Your listing has been published successfully.',
  'رپورٹ کرنے کے لیے پہلے لاگ اِن کریں۔':'Please sign in to report this listing.','رپورٹ کی وجہ لکھیں:':'Please enter a reason for reporting:',
  'رپورٹ جمع نہیں ہوئی: ':'Could not submit report: ','آپ کی رپورٹ موصول ہو گئی ہے۔':'Your report has been received.',
  'پراپرٹی کی تصویر':'Property image','پراپرٹی کی بڑی تصویر':'Full-size property image','میڈیا کھولیں':'Open media',
  'کمنٹس لوڈ نہیں ہو سکے۔':'Could not load comments.','ابھی کوئی کمنٹ نہیں۔ پہلا کمنٹ کریں۔':'No comments yet. Be the first to comment.',
  'کمنٹ کرنے کے لیے پہلے لاگ اِن کریں۔':'Please sign in before commenting.','صارف':'User',
  'کمنٹ بھیجا نہیں جا سکا: ':'Could not post comment: ','اطلاعات دیکھنے کے لیے لاگ اِن کریں۔':'Please sign in to view notifications.',
  'اطلاعات لوڈ نہیں ہو سکیں۔':'Could not load notifications.','ابھی کوئی نئی اطلاع نہیں۔':'No new notifications yet.',
  'آپ کے پراپرٹی اشتہار پر نیا کمنٹ آیا ہے۔':'A new comment has been posted on your property listing.',
  'اپنے اشتہارات دیکھنے کے لیے پہلے اکاؤنٹ میں لاگ اِن کریں۔':'Please sign in to view your listings.',
  'آپ کے اشتہارات لوڈ نہیں ہوئے: ':'Could not load your listings: ','پہلے لاگ اِن کریں۔':'Please sign in first.',
  'کیا آپ یہ اشتہار ختم کرنا چاہتے ہیں؟ یہ عام تلاش میں نظر نہیں آئے گا۔':'Do you want to remove this listing? It will no longer appear in public search.',
  'اشتہار ختم نہیں ہوا: ':'Could not remove listing: ','آپ کا اشتہار ختم کر دیا گیا ہے۔':'Your listing has been removed.',
  'ایڈمن دیکھنے کے لیے لاگ اِن کریں۔':'Please sign in to access Admin.','یہ حصہ صرف ایڈمن کے لیے ہے۔':'This section is for administrators only.',
  'ایڈمن موڈ فعال ہے۔':'Admin mode is active.','صرف ایڈمن اشتہار ہٹا سکتا ہے۔':'Only an administrator can remove a listing.',
  'کیا آپ واقعی یہ اشتہار ہٹانا چاہتے ہیں؟':'Are you sure you want to remove this listing?',
  'اشتہار ہٹا دیا گیا۔':'The listing has been removed.','ایپ چل رہی ہے، لیکن Supabase کی سیٹنگ ابھی درکار ہے۔':'The app is running, but Supabase setup is still required.',
  'Supabase سیٹنگ مکمل ہونے کے بعد تلاش شروع ہوگی۔':'Search will begin once the Supabase setup is complete.',
  'ایپ شروع نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔':'The app could not start. Please try again.',
  'تصاویر یا ویڈیوز':'Photos or Videos','میڈیا':'Media','ویڈیو':'Video','دن':'days','ماہ':'month',

  'پریمیم':'Premium','پریمیم پیکج منتخب کریں':'Choose a Premium package',
  'آپ کا پریمیم اسٹیٹس':'Your Premium status','پریمیم فعال ہے تا':'Premium active until',
  'ابھی پریمیم فعال نہیں':'Premium is not active yet','ادائیگی کا طریقہ':'Payment method',
  'اکاؤنٹ ٹائٹل':'Account title','اکاؤنٹ نمبر':'Account number',
  'رقم بھیجنے کے بعد ادائیگی کا اسکرین شاٹ اپلوڈ کریں۔':'After sending the payment, upload your payment screenshot.',
  'پیکج':'Package','— Property Agent Packages —':'— Property Agent Packages —','Starter Agent — 7 دن — Rs 500':'Starter Agent — 7 days — Rs 500','Professional Agent — 15 دن — Rs 900':'Professional Agent — 15 days — Rs 900','Business Agent — 30 دن — Rs 1,500':'Business Agent — 30 days — Rs 1,500','7 دن — Rs 300':'7 days — Rs 300','15 دن — Rs 500':'15 days — Rs 500',
  '30 دن — Rs 900':'30 days — Rs 900','ادائیگی کا اسکرین شاٹ':'Payment screenshot','JPG, PNG یا WEBP — زیادہ سے زیادہ 5MB':'JPG, PNG or WEBP — max 5MB',
  'ادائیگی کرنے والے کا نام':'Sender name','ادائیگی کی درخواست جمع کریں':'Submit payment for verification',
  'درخواست کی ہسٹری':'Payment request history','ابھی کوئی ادائیگی درخواست نہیں۔':'No payment requests yet.',
  'زیرِ تصدیق':'Pending verification','منظور':'Approved','مسترد':'Rejected',
  'آپ کی ادائیگی کی درخواست موصول ہو گئی ہے۔ تصدیق کے بعد Premium فعال ہو جائے گا۔':'Your payment request has been received. Premium will activate after verification.',
  'ادائیگی جمع کرنے کے لیے پہلے لاگ اِن کریں۔':'Please sign in before submitting a payment.',
  'ایڈمن ادائیگیوں کی تصدیق':'Admin payment verification','کوئی زیرِ تصدیق ادائیگی نہیں۔':'No pending payments.',
  'منظور کریں':'Approve','مسترد کریں':'Reject','ادائیگی کی درخواست منظور ہو گئی۔':'Payment request approved.',
  'ادائیگی کی درخواست مسترد ہو گئی۔':'Payment request rejected.','ادائیگی کی تصدیق نہیں ہو سکی: ':'Could not review payment: ',
  'پریمیم اسٹیٹس لوڈ نہیں ہو سکا: ':'Could not load Premium status: ','صرف ایڈمن ادائیگی منظور کر سکتا ہے۔':'Only an administrator can approve payments.',
  'ادائیگی کا اسکرین شاٹ اپلوڈ کریں۔':'Upload the payment screenshot.','اسکرین شاٹ دیکھیں':'View screenshot','اسکرین شاٹ دستیاب نہیں':'Screenshot unavailable','ادائیگی کا اسکرین شاٹ':'Payment screenshot','ادائیگی اکاؤنٹ':'Payment account','پریمیم پیکج':'Premium package','مدت کے دوران ہر 10 دن والی مفت اشتہار حد ختم؛ مزید اشتہارات لگائیں۔':'Post additional listings during your Premium period without the 10-day free-post limit.','پریمیم حاصل کریں':'Get Premium',
  'پریمیم دیکھنے اور ادائیگی جمع کرنے کے لیے پہلے لاگ اِن کریں۔':'Sign in to view Premium and submit a payment.',
  'ایجنٹ بزنس پروفائل':'Agent Business Profile','ایجنٹ پیکج فعال ہونے کے بعد اپنا کاروباری پروفائل مکمل کریں۔':'Complete your business profile after your Agent package is activated.',
  'کاروبار / ایجنسی کا نام':'Business / Agency Name','رابطہ موبائل نمبر':'Contact Mobile Number','مختصر تعارف':'Short Description','پروفائل محفوظ کریں':'Save Profile',
  'کاروبار کا نام اور رابطہ نمبر لازمی درج کریں۔':'Business name and contact number are required.','آپ کا ایجنٹ پروفائل محفوظ ہو گیا ہے۔':'Your Agent profile has been saved.',
  'ایجنٹ پروفائل محفوظ نہیں ہوا: ':'Could not save Agent profile: ','Verified Agent':'Verified Agent','پرائیویسی پالیسی':'Privacy Policy','استعمال کی شرائط':'Terms of Use','RENT MATCH میں خوش آمدید':'Welcome to RENT MATCH','گھر یا دکان تلاش کرنے، اشتہار لگانے اور تمام سہولیات استعمال کرنے کے لیے پہلے لاگ اِن کریں یا نیا اکاؤنٹ بنائیں۔':'Sign in or create an account to find homes or shops, post listings and use all features.','Google / Gmail سے لاگ اِن یا سائن اپ کریں':'Continue with Google / Gmail','Facebook سے لاگ اِن یا سائن اپ کریں':'Continue with Facebook','نیا اکاؤنٹ بنانے کے لیے بھی یہی آپشن استعمال کریں۔':'Use either option to create a new account too.','WELCOME':'WELCOME','صارفین کی رپورٹس':'User Reports','ابھی کوئی رپورٹ موصول نہیں ہوئی۔':'No reports have been received yet.','رپورٹس لوڈ نہیں ہو سکیں: ':'Could not load reports: ','پراپرٹی دستیاب نہیں':'Property unavailable','اشتہار: ':'Listing: ','رپورٹ کنندہ: ':'Reporter: ','کارروائی مکمل / اشتہار غیر فعال':'Action completed / listing inactive'

};
let currentLanguage = 'ur';
const reverseTranslations = Object.fromEntries(Object.entries(translations).map(([ur, en]) => [en, ur]));
function translateValue(value, lang = currentLanguage) {
  if (lang === 'en') return translations[value] || value;
  return reverseTranslations[value] || value;
}
function translateApp(root = document.querySelector('#app')) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const trimmed = node.nodeValue.trim();
    if (!trimmed) continue;
    const translated = translateValue(trimmed);
    if (translated !== trimmed) node.nodeValue = node.nodeValue.replace(trimmed, translated);
  }
  root.querySelectorAll('[placeholder], [aria-label], [title], [alt]').forEach(el => {
    for (const attr of ['placeholder', 'aria-label', 'title', 'alt']) {
      const value = el.getAttribute(attr);
      if (value) el.setAttribute(attr, translateValue(value));
    }
  });
}
function applyLanguage(lang) {
  currentLanguage = lang === 'en' ? 'en' : 'ur';
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === 'en' ? 'ltr' : 'rtl';
  translateApp();
  localStorage.setItem('rent-match-language', currentLanguage);
}
let languageObserver;
function watchDynamicTranslations() {
  const root = document.querySelector('#app');
  if (!root || languageObserver) return;
  languageObserver = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') {
        const translated = translateValue(record.target.nodeValue.trim());
        if (translated !== record.target.nodeValue.trim() && record.target.nodeValue.trim()) {
          const original = record.target.nodeValue.trim();
          record.target.nodeValue = record.target.nodeValue.replace(original, translated);
        }
      }
      record.addedNodes?.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const original = node.nodeValue.trim();
          const translated = translateValue(original);
          if (original && translated !== original) node.nodeValue = node.nodeValue.replace(original, translated);
        } else if (node.nodeType === Node.ELEMENT_NODE) translateApp(node);
      });
      if (record.type === 'attributes') translateApp(record.target.parentElement || root);
    }
  });
  languageObserver.observe(root, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['placeholder','aria-label','title','alt']});
}



function notice(message) {
  const toast = $('#appToast');
  const text = translateValue(message);
  if (!toast) { alert(text); return; }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(notice.timer);
  notice.timer = setTimeout(() => toast.classList.remove('show'), 3800);
}
function esc(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function shell() {
  $('#app').innerHTML = `
  <section id="authGate" class="auth-gate hidden" dir="rtl">
    <div class="auth-card">
      <div class="auth-logo">🏠 RENT MATCH</div>
      <span class="auth-kicker">WELCOME</span>
      <h1>RENT MATCH میں خوش آمدید</h1>
      <p>گھر یا دکان تلاش کرنے، اشتہار لگانے اور تمام سہولیات استعمال کرنے کے لیے پہلے لاگ اِن کریں یا نیا اکاؤنٹ بنائیں۔</p>
      <button id="gateGoogleLogin" class="primary auth-action" type="button">Google / Gmail سے لاگ اِن یا سائن اپ کریں</button>
      <button id="gateFacebookLogin" class="secondary auth-action" type="button">Facebook سے لاگ اِن یا سائن اپ کریں</button>
      <p class="auth-footnote">نیا اکاؤنٹ بنانے کے لیے بھی یہی آپشن استعمال کریں۔</p>
      <div class="auth-links"><a href="/privacy.html">پرائیویسی پالیسی</a><span>·</span><a href="/terms.html">استعمال کی شرائط</a></div>
    </div>
  </section>
  <header id="appHeader"><div class="wrap"><div class="brand-row"><div class="brand">🏠 RENT MATCH</div><label class="language-label">زبان / Language<select id="languageSelect" aria-label="Language"><option value="ur">اردو</option><option value="en">English</option></select></label></div>
    <p>صحیح پراپرٹی، صحیح کرایہ دار — آسانی سے</p>
    <nav>
      <button data-tab="search" class="active">پراپرٹی تلاش کریں</button>
      <button data-tab="post">اشتہار لگائیں</button>
      <button data-tab="wanted">ضرورت درج کریں</button>
      <button data-tab="mine">میرے اشتہارات</button>
      <button data-tab="notifications">اطلاعات <span id="notificationCount" class="notification-count hidden">0</span></button>
      <button data-tab="account">اکاؤنٹ</button>
      <button data-tab="premium">پریمیم</button>
      <button data-tab="admin">ایڈمن</button>
    </nav></div></header>
  <main id="appMain" class="wrap">
    <div class="page-layout"><div class="page-content">
    <section id="search" class="tab">
      <div class="search-intro">
        <span class="eyebrow">RENT MATCH</span>
        <h1>گھر یا دکان تلاش کریں</h1>
        <p>اپنی ضرورت کے مطابق پراپرٹی تلاش کرنے کے لیے یہاں کلک کریں۔</p>
        <button id="openPropertySearch" class="primary" type="button">گھر یا دکان تلاش کریں</button>
      </div>
      <div class="earning-below-search">      <section class="earning-panel" aria-labelledby="earningTitle">
        <div class="earning-heading"><span class="eyebrow">RENT MATCH BUSINESS</span><h2 id="earningTitle">اپنے اشتہار کو نمایاں کریں اور جلد کرایہ دار پائیں</h2><p>عام پراپرٹی اشتہار ہمیشہ مفت رہے گا۔ اضافی رسائی کے لیے اختیاری paid سہولیات پیش کی جائیں گی۔</p><p class="muted">عام صارف ہر 10 دن میں ایک مفت اشتہار لگا سکتا ہے۔ اضافی اشتہارات کے لیے Premium پیکج دستیاب ہوگا۔</p></div>
        <div class="earning-grid">
          <article class="earning-card featured-plan"><span class="earning-badge">⭐ Premium</span><h3>پریمیم پیکج</h3><p>مدت کے دوران ہر 10 دن والی مفت اشتہار حد ختم؛ مزید اشتہارات لگائیں۔</p><ul><li>7 دن — Rs 300</li><li>15 دن — Rs 500</li><li>30 دن — Rs 900</li></ul><button type="button" class="primary" id="openPremiumFromCard">پریمیم حاصل کریں</button></article>
          <article class="earning-card agent-plan"><span class="earning-badge">🏢 Property Agent</span><h3>پراپرٹی ڈیلر پیکجز</h3><p>ڈیلرز اور ایجنٹس کے لیے الگ پیکجز، زیادہ اشتہارات اور کاروباری پروفائل۔</p><ul><li>اسٹارٹر ایجنٹ — 7 دن — Rs 500</li><li>پروفیشنل ایجنٹ — 15 دن — Rs 900</li><li>بزنس ایجنٹ — 30 دن — Rs 1,500</li></ul><p><strong>40 فعال اشتہارات تک</strong></p><ul><li>الگ ایجنٹ پروفائل اور Verified Agent بیج</li><li>تمام اشتہارات ایک جگہ مینیج کریں</li><li>پروفائل پر کاروباری رابطہ نمبر</li></ul><button type="button" class="primary" id="openAgentPackages">ایجنٹ پیکج حاصل کریں</button></article>
          <article class="earning-card"><span class="earning-badge">📢 جلد دستیاب</span><h3>کاروباری بینر اشتہارات</h3><p>بلڈرز، فرنیچر شاپس، شفٹنگ سروسز اور مقامی کاروبار کے لیے اشتہاری جگہ۔</p><strong>کاروباری اشتہارات کا نظام جلد دستیاب ہوگا۔</strong></article>
        </div>
        <p class="earning-note">نوٹ: پریمیم اور ایجنٹ پیکج کی ادائیگی اسکرین شاٹ اور ایڈمن کی تصدیق کے بعد فعال ہوگی۔ خودکار آن لائن گیٹ وے اور نمایاں اشتہار ابھی فعال نہیں ہیں۔</p>
      </section></div>
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
      <p id="postLimitStatus" class="notice">اشتہار لگانے کا اسٹیٹس چیک کیا جا رہا ہے…</p><form id="postForm" class="grid">
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

    <section id="premium" class="tab hidden">
      <div class="panel premium-panel">
        <h2>پریمیم پیکج منتخب کریں</h2>
        <p id="premiumStatus" class="notice">آپ کا پریمیم اسٹیٹس لوڈ ہو رہا ہے…</p>
        <div class="payment-account">
          <h3>ادائیگی اکاؤنٹ</h3>
          <p><strong>اکاؤنٹ ٹائٹل:</strong> Rana Aqib</p>
          <p><strong>EasyPaisa / JazzCash:</strong> <bdi>03326830870</bdi></p>
          <p class="muted">رقم بھیجنے کے بعد ادائیگی کا اسکرین شاٹ اپلوڈ کریں۔ ادائیگی کی تصدیق ایڈمن کرے گا۔</p>
        </div>
        <form id="premiumPaymentForm" class="grid premium-form">
          <label>پیکج<select name="plan_code" required>
            <option value="premium_7_days">7 دن — Rs 300</option>
            <option value="premium_15_days">15 دن — Rs 500</option>
            <option value="premium_30_days">30 دن — Rs 900</option>
            <option disabled>— Property Agent Packages —</option>
            <option value="agent_starter_7_days">Starter Agent — 7 دن — Rs 500</option>
            <option value="agent_professional_15_days">Professional Agent — 15 دن — Rs 900</option>
            <option value="agent_business_30_days">Business Agent — 30 دن — Rs 1,500</option>
          </select></label>
          <label>ادائیگی کا طریقہ<select name="payment_method" required>
            <option value="easypaisa">EasyPaisa</option>
            <option value="jazzcash">JazzCash</option>
          </select></label>
          <label>ادائیگی کا اسکرین شاٹ (JPG, PNG یا WEBP — زیادہ سے زیادہ 5MB)<input name="payment_screenshot" type="file" accept="image/jpeg,image/png,image/webp" required></label>
          <label>ادائیگی کرنے والے کا نام<input name="payer_name" maxlength="100"></label>
          <button class="primary" type="submit">ادائیگی کی درخواست جمع کریں</button>
        </form>
        <h3 class="payment-history-title">درخواست کی ہسٹری</h3>
        <div id="premiumHistory"></div>
        <section class="agent-profile-panel">
          <h3>ایجنٹ بزنس پروفائل</h3>
          <p id="agentProfileStatus" class="muted">ایجنٹ پیکج فعال ہونے کے بعد اپنا کاروباری پروفائل مکمل کریں۔</p>
          <form id="agentProfileForm" class="grid hidden">
            <label>کاروبار / ایجنسی کا نام<input name="business_name" maxlength="100" required></label>
            <label>رابطہ موبائل نمبر<input name="contact_phone" type="tel" maxlength="25" required></label>
            <label class="wide">مختصر تعارف<textarea name="bio" maxlength="500" placeholder="اپنی پراپرٹی سروسز کا مختصر تعارف لکھیں"></textarea></label>
            <button class="primary" type="submit">پروفائل محفوظ کریں</button>
          </form>
        </section>
      </div>
    </section>
    <section id="admin" class="tab hidden"><div class="panel"><h2>ایڈمن کنٹرول</h2><p id="adminStatus">ایڈمن اکاؤنٹ سے لاگ اِن کریں۔</p><div id="adminPayments" class="admin-payments"></div><section class="admin-reports"><h3>صارفین کی رپورٹس</h3><div id="adminReports"></div></section><h3>تمام پراپرٹی اشتہارات</h3><div id="adminListings" class="cards"></div></div></section>
    <div class="notice">پراپرٹی دیکھے اور مالک کی شناخت کی تصدیق کیے بغیر ایڈوانس نہ دیں۔</div>
      </div>

    </div>
  </main><div id="mediaViewer" class="media-viewer hidden" role="dialog" aria-modal="true" aria-label="Media viewer"><button type="button" class="media-viewer-close" aria-label="Close">×</button><div id="mediaViewerContent" class="media-viewer-content"></div></div><div id="appToast" class="app-toast" role="status" aria-live="polite"></div><footer>RENT MATCH © · <a href="/privacy.html">پرائیویسی پالیسی</a> · <a href="/terms.html">استعمال کی شرائط</a></footer>`;

  const languageSelect = $('#languageSelect');
  if (languageSelect) {
    languageSelect.value = localStorage.getItem('rent-match-language') || 'ur';
    languageSelect.addEventListener('change', e => applyLanguage(e.target.value));
    applyLanguage(languageSelect.value);
    watchDynamicTranslations();
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
  $('#gateGoogleLogin').addEventListener('click', () => loginWithProvider('google'));
  $('#gateFacebookLogin').addEventListener('click', () => loginWithProvider('facebook'));
  $('#facebookLogin').addEventListener('click', () => loginWithProvider('facebook'));
  $('#logout').addEventListener('click', logout);
  $('#premiumPaymentForm').addEventListener('submit', submitPremiumPayment);
  $('#agentProfileForm').addEventListener('submit', saveAgentProfile);
  $('#openPremiumFromCard').addEventListener('click', () => tab('premium'));
  $('#openAgentPackages').addEventListener('click', () => { tab('premium'); const s = $('#premiumPaymentForm select[name="plan_code"]'); if (s) s.value = 'agent_starter_7_days'; });
  $('#nearMe').addEventListener('click', async () => { await detectLocation(true); await loadListings(); });
}
function setAppAccess() {
  const allowed = !!state.user;
  $('#authGate')?.classList.toggle('hidden', allowed);
  $('#appHeader')?.classList.toggle('hidden', !allowed);
  $('#appMain')?.classList.toggle('hidden', !allowed);
  // Admin navigation is visible only to accounts whose Supabase profile role is admin.
  document.querySelector('nav button[data-tab="admin"]')?.classList.toggle('hidden', !allowed || !state.admin);
  if (!allowed) {
    state.tab = 'search';
    updateNotificationBadge(0);
  } else if (!state.admin && state.tab === 'admin') {
    state.tab = 'search';
    document.querySelectorAll('.tab').forEach(section => section.classList.toggle('hidden', section.id !== 'search'));
    document.querySelectorAll('nav button').forEach(button => button.classList.toggle('active', button.dataset.tab === 'search'));
  }
}
function tab(name) {
  if (!state.user) { setAppAccess(); return; }
  if (name === 'admin' && !state.admin) return notice('یہ حصہ صرف ایڈمن کے لیے ہے۔');
  state.tab = name;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('hidden', s.id !== name));
  if (name === 'search') loadListings();
  if (name === 'post') loadPostLimitStatus();
  if (name === 'admin') loadAdmin();
  if (name === 'premium') loadPremium();
  if (name === 'mine') loadMyListings();
  if (name === 'notifications') loadNotifications();
}
function isVideoMedia(url) { return /\.(mp4|webm|mov)(\?|$)/i.test(String(url || '')); }
function mediaButton(url, index, cover = false) {
  const video = isVideoMedia(url);
  const preview = video ? `<video class="${cover ? 'property-cover' : 'extra-media'}" src="${esc(url)}#t=0.1" muted playsinline preload="metadata"></video><span class="media-play-icon">▶</span>` : `<img class="${cover ? 'property-cover' : 'extra-media'}" src="${esc(url)}" alt="پراپرٹی کی تصویر" loading="lazy">`;
  return `<button type="button" class="media-open ${cover ? 'media-open-cover' : ''}" data-open-media="${esc(url)}" data-media-type="${video ? 'video' : 'image'}" aria-label="میڈیا کھولیں">${preview}</button>`;
}
function card(x, showOwnerDelete = false) {
  const photos = Array.isArray(x.photo_urls) ? x.photo_urls : [];
  const cover = photos[0] ? mediaButton(photos[0], 0, true) : '<div class="property-placeholder">🏠<span>تصویر دستیاب نہیں</span></div>';
  const videoCount = photos.filter(isVideoMedia).length;
  const agentProfile = state.agentProfiles[x.owner_id];
  const phone = String(x.owner_phone || '').replace(/[^\d+]/g, '');
  const agentPhone = String(agentProfile?.contact_phone || '').replace(/[^\d+]/g, '');
  let agentWhatsapp = agentPhone.replace(/\D/g, '');
  if (agentWhatsapp.startsWith('00')) agentWhatsapp = agentWhatsapp.slice(2);
  if (agentWhatsapp.startsWith('0')) agentWhatsapp = '92' + agentWhatsapp.slice(1);
  else if (agentWhatsapp.startsWith('3') && agentWhatsapp.length === 10) agentWhatsapp = '92' + agentWhatsapp;
  let whatsapp = phone.replace(/\D/g, '');
  if (whatsapp.startsWith('00')) whatsapp = whatsapp.slice(2);
  if (whatsapp.startsWith('0')) whatsapp = '92' + whatsapp.slice(1);
  else if (whatsapp.startsWith('3') && whatsapp.length === 10) whatsapp = '92' + whatsapp;
  const whatsappHref = whatsapp ? 'https://wa.me/' + whatsapp : '';
  return `<article class="card property-card">
    <div class="property-media">${cover}${photos.length > 1 ? `<span class="photo-count">📷 ${photos.length} میڈیا${videoCount ? ` · ${videoCount} ویڈیو` : ''}</span>` : ''}</div>
    <div class="body">
      <div class="property-tags"><span class="pill">${esc(x.type)}</span><span class="pill">📍 ${esc(x.area)}</span>${agentProfile ? `<span class="pill verified-agent-badge">✓ Verified Agent</span>` : ''}</div>
      ${agentProfile ? `<div class="agent-business-name">🏢 ${esc(agentProfile.business_name)}</div>` : ''}
      <div class="price">Rs ${Number(x.rent).toLocaleString('en-PK')} <small>/ ماہ</small></div>
      <div class="property-summary">${esc(x.size || 'مزید تفصیل کے لیے کلک کریں')}</div>
      <button class="primary details-toggle" type="button" data-details="${esc(x.id)}" aria-expanded="false">تفصیل دیکھیں ↓</button>
      ${showOwnerDelete ? `<button class="danger owner-delete-btn" type="button" data-own-remove="${esc(x.id)}">🗑 اشتہار ڈیلیٹ کریں</button>` : ''}
      <div class="property-details hidden" id="details-${esc(x.id)}">
        <div class="detail-line"><strong>ایڈوانس:</strong> Rs ${Number(x.advance || 0).toLocaleString('en-PK')}</div>
        ${agentProfile ? `<div class="agent-public-profile"><strong>✓ Verified Agent · ${esc(agentProfile.business_name)}</strong>${agentProfile.bio ? `<p>${esc(agentProfile.bio)}</p>` : ''}<div class="actions"><a class="btn primary" href="tel:${esc(agentPhone)}">Call Agent</a><a class="btn secondary" href="https://wa.me/${esc(agentWhatsapp)}" target="_blank" rel="noopener">WhatsApp Agent</a></div></div>` : ''}
        ${x.description ? `<p>${esc(x.description)}</p>` : ''}
        ${photos.length > 1 ? `<div class="extra-photos">${photos.slice(1).map((u, i) => mediaButton(u, i + 1)).join('')}</div>` : ''}
        <div class="actions">
          <a class="btn primary call-icon-btn" href="tel:${esc(phone)}" aria-label="کال کریں" title="کال کریں"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.32.56 3.58.56.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.6 21 3 13.4 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.26.19 2.46.56 3.58a1 1 0 0 1-.24 1.02z"/></svg></a>
          <a class="btn secondary whatsapp-icon-btn" target="_blank" rel="noopener noreferrer" href="${esc(whatsappHref)}" aria-label="WhatsApp پر رابطہ کریں" title="WhatsApp پر رابطہ کریں"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.4 1.3h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.1-1.2-6.1-3.5-8.3ZM12.2 21.6c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.9 1 1-3.8-.2-.4a9.7 9.7 0 1 1 8.2 4.7Zm5.3-7.3c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.5-1.7-1.7-2-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6-.1-.2-.7-1.6-.9-2.1-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.5s1.1 2.8 1.3 3c.2.2 2.2 3.4 5.4 4.8.8.4 1.4.6 1.9.7.8.3 1.5.2 2 .1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z"/></svg></a>
          ${x.owner_id !== state.user?.id ? `<button class="danger" data-report="${esc(x.id)}">رپورٹ کریں</button>` : ''}
          ${state.admin ? `<button class="danger" data-remove="${esc(x.id)}">اشتہار ہٹائیں</button>` : ''}
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
async function render(items, target = 'results') {
  const el = $('#' + target);
  if (!el) return;
  await loadActiveAgentProfiles(items || []);
  el.innerHTML = items?.length ? items.map(item => card(item, target === 'myListings')).join('') : '<div class="empty">اس وقت کوئی مناسب پراپرٹی نہیں ملی۔</div>';
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
      () => resolve(null), { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
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
  let q = supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(100);
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
    if ($('#locationStatus')) $('#locationStatus').textContent = 'آپ کی لوکیشن دستیاب نہیں؛ کسی شہر یا علاقے کا نام لکھ کر تلاش کریں۔';    render([], target);
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
  await render(state.listings, target);
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
async function loadPostLimitStatus() {
  const el = $('#postLimitStatus');
  if (!el) return;
  if (!state.user) { el.textContent = 'اشتہار لگانے کے لیے پہلے Google یا Facebook سے لاگ اِن کریں۔'; return; }
  const { data, error } = await supabase.rpc('get_listing_post_status');
  if (error) { el.textContent = 'آپ کا اشتہار لگانے کا اسٹیٹس ابھی لوڈ نہیں ہو سکا۔'; return; }
  const status = Array.isArray(data) ? data[0] : data;
  if (status?.is_allowed) {
    el.textContent = status.is_premium ? 'آپ کا Premium فعال ہے؛ آپ اضافی اشتہارات لگا سکتے ہیں۔' : 'آپ کا اگلا اشتہار لگانے کا حق دستیاب ہے۔';
  } else {
    const date = status?.next_free_at ? new Date(status.next_free_at).toLocaleDateString() : '';
    el.textContent = 'آپ کا مفت اشتہار استعمال ہو چکا ہے۔ اگلا مفت اشتہار ' + (date || '10 دن بعد') + ' لگا سکیں گے۔ اضافی اشتہارات کے لیے Premium پیکج دیکھیں۔';
  }
}
async function publish(e) {
  e.preventDefault();
  if (!supabase) return notice('Supabase سیٹنگ مکمل نہیں۔');
  if (!state.user) return notice('پہلے Google یا Facebook سے لاگ اِن کریں۔');
  const form = e.currentTarget;
  const f = new FormData(form);
  const phone = String(f.get('owner_phone') || '').trim();
  const area = String(f.get('area') || '').trim();
  const rent = Number(f.get('rent'));
  const advance = Number(f.get('advance') || 0);
  if (!area) return notice('شہر یا علاقہ درج کریں۔');
  if (!phone || phone.replace(/\D/g, '').length < 10) return notice('درست موبائل نمبر درج کریں۔');
  if (!Number.isFinite(rent) || rent <= 0 || !Number.isFinite(advance) || advance < 0) return notice('کرایہ اور ایڈوانس کی رقم درست درج کریں۔');

  // Check entitlement before uploading media; the database trigger remains the final authority.
  const { data: limitData, error: limitError } = await supabase.rpc('get_listing_post_status');
  if (limitError) return notice('اشتہار لگانے کا اسٹیٹس چیک نہیں ہو سکا: ' + limitError.message);
  const limit = Array.isArray(limitData) ? limitData[0] : limitData;
  if (!limit?.is_allowed) {
    await loadPostLimitStatus();
    return notice('مفت اشتہار کی حد پوری ہو چکی ہے۔ اضافی اشتہار کے لیے Premium پیکج منتخب کریں۔');
  }

  const files = f.getAll('photos').filter(file => file instanceof File && file.size);
  if (files.length > 5) return notice('زیادہ سے زیادہ 5 تصاویر یا ویڈیوز اپ لوڈ کر سکتے ہیں۔');
  const uploadedPaths = [];
  const photos = [];
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'اشتہار شائع ہو رہا ہے…'; }
  try {
    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const allowedImage = ['image/jpeg','image/png','image/webp'].includes(file.type);
      const allowedVideo = ['video/mp4','video/webm','video/quicktime'].includes(file.type);
      if (!allowedImage && !allowedVideo) throw new Error('صرف JPG, PNG, WEBP تصاویر یا MP4, WEBM, MOV ویڈیوز اپ لوڈ کریں۔');
      if (isVideo && file.size > 25 * 1024 * 1024) throw new Error('ہر ویڈیو 25MB سے کم ہونی چاہیے۔');
      if (!isVideo && file.size > 5 * 1024 * 1024) throw new Error('ہر تصویر 5MB سے کم ہونی چاہیے۔');
      const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || (isVideo ? 'mp4' : 'jpg');
      const path = `${state.user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('listing-photos').upload(path, file, {
        contentType: file.type, cacheControl: '3600', upsert: false
      });
      if (uploadError) throw new Error('تصویر اپ لوڈ نہیں ہوئی: ' + uploadError.message);
      uploadedPaths.push(path);
      photos.push(supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl);
    }

    const coords = f.get('use_current_location') === 'on' ? (state.location || await getPosition()) : null;
    const payload = {
      owner_id: state.user.id, owner_phone: phone, type: f.get('type'),
      area, rent, advance, size: String(f.get('size') || '').trim(),
      description: String(f.get('description') || '').trim(), photo_urls: photos, status: 'active',
      latitude: coords?.latitude ?? null, longitude: coords?.longitude ?? null
    };
    const { error } = await supabase.from('listings').insert(payload);
    if (error) {
      if (String(error.message || '').includes('FREE_LISTING_LIMIT')) throw new Error('مفت اشتہار کی حد پوری ہو چکی ہے۔ اگلا مفت اشتہار 10 دن بعد لگا سکیں گے۔ اضافی اشتہار کے لیے Premium پیکج منتخب کریں۔');
      if (String(error.message || '').includes('FREE_LISTING_LIMIT_10_DAYS')) throw new Error('مفت اشتہار کی حد پوری ہو چکی ہے۔ اگلا مفت اشتہار 10 دن بعد لگا سکیں گے۔ اضافی اشتہار کے لیے Premium پیکج منتخب کریں۔');
      if (String(error.message || '').includes('AGENT_LISTING_LIMIT_REACHED') || String(error.message || '').includes('AGENT_LISTING_LIMIT_40')) throw new Error('آپ کے ایجنٹ پیکج کی 40 فعال اشتہارات کی حد پوری ہو چکی ہے۔');
      throw new Error('اشتہار جمع نہیں ہوا: ' + error.message);
    }
    notice('آپ کا اشتہار فوراً شائع ہو گیا ہے۔');
    form.reset();
    tab('search');
    await loadListings();
  } catch (error) {
    if (uploadedPaths.length) await supabase.storage.from('listing-photos').remove(uploadedPaths);
    notice(error.message || 'اشتہار شائع نہیں ہو سکا۔ دوبارہ کوشش کریں۔');
  } finally {
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'اشتہار شائع کریں'; }
  }
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
  await render(data || [], 'wantedResults');
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
  await render(data || [], 'myListings');
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
  await render(data || [], 'adminListings');
  await loadPaymentRequests();
  await loadAdminReports();
}

async function loadAdminReports() {
  if (!state.admin || !supabase) return;
  const el = $('#adminReports');
  if (!el) return;
  const { data: reports, error } = await supabase.from('listing_reports')
    .select('id,listing_id,reporter_id,reason,created_at')
    .order('created_at', { ascending: false }).limit(100);
  if (error) { el.textContent = 'رپورٹس لوڈ نہیں ہو سکیں: ' + error.message; return; }
  if (!reports?.length) { el.innerHTML = '<div class="empty">ابھی کوئی رپورٹ موصول نہیں ہوئی۔</div>'; return; }
  const ids = [...new Set(reports.map(r => r.listing_id))];
  const { data: listings } = await supabase.from('listings').select('id,type,area,rent,status').in('id', ids);
  const byId = Object.fromEntries((listings || []).map(x => [x.id, x]));
  el.innerHTML = reports.map(r => {
    const listing = byId[r.listing_id];
    return `<article class="admin-report-row">
      <div><strong>${esc(listing ? listing.type + ' · ' + listing.area : 'پراپرٹی دستیاب نہیں')}</strong>
      <p>${esc(r.reason)}</p><small>${new Date(r.created_at).toLocaleString()} · رپورٹ کنندہ: ${esc(r.reporter_id)}</small>
      <small>اشتہار: ${esc(listing?.status || 'حذف شدہ')} ${listing ? '· Rs ' + Number(listing.rent).toLocaleString('en-PK') : ''}</small></div>
      ${listing?.status === 'active' ? `<button class="danger" type="button" data-report-remove="${esc(r.listing_id)}">اشتہار ہٹائیں</button>` : '<span class="pill">کارروائی مکمل / اشتہار غیر فعال</span>'}
    </article>`;
  }).join('');
  el.querySelectorAll('[data-report-remove]').forEach(btn => btn.addEventListener('click', async () => {
    await removeListing(btn.dataset.reportRemove);
    await loadAdminReports();
  }));
}

async function loadActiveAgentProfiles(items) {
  const ids = [...new Set((items || []).map(x => x.owner_id).filter(Boolean))];
  if (!ids.length || !supabase) { state.agentProfiles = {}; return; }
  const { data, error } = await supabase.rpc('get_active_agent_profiles', { p_user_ids: ids });
  if (error) { console.warn('Could not load verified agent profiles:', error.message); state.agentProfiles = {}; return; }
  state.agentProfiles = Object.fromEntries((data || []).map(p => [p.user_id, p]));
}

async function loadAgentProfile() {
  const statusEl = $('#agentProfileStatus'), form = $('#agentProfileForm');
  if (!statusEl || !form || !state.user) return;
  const { data: status, error: statusError } = await supabase.rpc('get_my_agent_status');
  if (statusError) { statusEl.textContent = 'Agent status could not be loaded: ' + statusError.message; form.classList.add('hidden'); return; }
  if (!status?.active) {
    statusEl.textContent = 'اپنا Agent package خریدیں اور admin approval کے بعد یہاں اپنا business profile بنائیں۔';
    form.classList.add('hidden'); return;
  }
  const { data, error } = await supabase.from('agent_profiles').select('business_name,contact_phone,bio').eq('user_id', state.user.id).maybeSingle();
  if (error) { statusEl.textContent = 'Profile could not be loaded: ' + error.message; return; }
  form.classList.remove('hidden');
  form.elements.business_name.value = data?.business_name || '';
  form.elements.contact_phone.value = data?.contact_phone || '';
  form.elements.bio.value = data?.bio || '';
  const until = status.active_until ? new Date(status.active_until).toLocaleDateString() : '';
  statusEl.textContent = 'Verified Agent package active' + (until ? ' until ' + until : '') + '. Complete your public business profile below.';
}

async function saveAgentProfile(e) {
  e.preventDefault();
  if (!supabase || !state.user) return notice('پہلے لاگ اِن کریں۔');
  const form = e.currentTarget, data = new FormData(form);
  const business_name = String(data.get('business_name') || '').trim();
  const contact_phone = String(data.get('contact_phone') || '').trim();
  const bio = String(data.get('bio') || '').trim();
  if (!business_name || !contact_phone) return notice('کاروبار کا نام اور رابطہ نمبر لازمی درج کریں۔');
  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = true;
  const { error } = await supabase.from('agent_profiles').upsert({
    user_id: state.user.id, business_name, contact_phone, bio
  }, { onConflict: 'user_id' });
  if (button) button.disabled = false;
  if (error) return notice('ایجنٹ پروفائل محفوظ نہیں ہوا: ' + error.message);
  notice('آپ کا ایجنٹ پروفائل محفوظ ہو گیا ہے۔');
  await loadAgentProfile();
  await loadListings();
}

async function loadPremium() {
  if (!supabase || !state.user) {
    $('#premiumStatus').textContent = 'پریمیم دیکھنے اور ادائیگی جمع کرنے کے لیے پہلے لاگ اِن کریں۔';
    $('#premiumHistory').innerHTML = '';
    return;
  }
  const [{ data: until, error: statusError }, { data: requests, error: historyError }] = await Promise.all([
    supabase.rpc('get_my_premium_status'),
    supabase.from('premium_payment_requests').select('id,plan_code,amount,payment_method,screenshot_path,status,created_at,admin_note')
      .eq('user_id', state.user.id).order('created_at', { ascending: false }).limit(10)
  ]);
  if (statusError) return notice('پریمیم اسٹیٹس لوڈ نہیں ہو سکا: ' + statusError.message);
  $('#premiumStatus').textContent = until && new Date(until) > new Date()
    ? 'پریمیم فعال ہے تا: ' + new Date(until).toLocaleString()
    : 'ابھی پریمیم فعال نہیں۔';
  if (historyError) return notice(historyError.message);
  await loadAgentProfile();
  const statusLabel = { pending:'زیرِ تصدیق', approved:'منظور', rejected:'مسترد' };
  const historyRows = await Promise.all((requests || []).map(async r => {
    const { data: proof } = r.screenshot_path
      ? await supabase.storage.from('premium-payment-screenshots').createSignedUrl(r.screenshot_path, 600)
      : { data: null };
    return `
      <div class="payment-history-row">
        <strong>Rs ${Number(r.amount).toLocaleString('en-PK')} · ${esc(r.payment_method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash')}</strong>
        <span>${esc(statusLabel[r.status] || r.status)}</span>
        <small>${new Date(r.created_at).toLocaleString()}</small>
        ${proof?.signedUrl ? `<a class="payment-proof-link" href="${esc(proof.signedUrl)}" target="_blank" rel="noopener">اسکرین شاٹ دیکھیں</a>` : '<small>اسکرین شاٹ دستیاب نہیں</small>'}
        ${r.admin_note ? `<small>${esc(r.admin_note)}</small>` : ''}
      </div>`;
  }));
  $('#premiumHistory').innerHTML = historyRows.length ? historyRows.join('') : '<div class="empty">ابھی کوئی ادائیگی درخواست نہیں۔</div>';
}
async function submitPremiumPayment(e) {
  e.preventDefault();
  if (!supabase || !state.user) return notice('ادائیگی جمع کرنے کے لیے پہلے لاگ اِن کریں۔');
  const f = new FormData(e.target);
  const plan = String(f.get('plan_code') || '');
  const amounts = { premium_7_days:300, premium_15_days:500, premium_30_days:900, agent_starter_7_days:500, agent_professional_15_days:900, agent_business_30_days:1500 };
  const screenshot = f.get('payment_screenshot');
  if (!amounts[plan]) return;
  if (!(screenshot instanceof File) || !screenshot.size) return notice('ادائیگی کا اسکرین شاٹ اپلوڈ کریں۔');
  const allowedTypes = ['image/jpeg','image/png','image/webp'];
  if (!allowedTypes.includes(screenshot.type)) return notice('صرف JPG, PNG یا WEBP اسکرین شاٹ اپلوڈ کریں۔');
  if (screenshot.size > 5 * 1024 * 1024) return notice('اسکرین شاٹ 5MB سے کم ہونا چاہیے۔');
  const ext = screenshot.type === 'image/jpeg' ? 'jpg' : screenshot.type === 'image/png' ? 'png' : 'webp';
  const screenshotPath = `${state.user.id}/${crypto.randomUUID()}.${ext}`;
  const submitButton = e.target.querySelector('button[type="submit"]');
  if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'اپلوڈ ہو رہا ہے…'; }
  const { error: uploadError } = await supabase.storage.from('premium-payment-screenshots')
    .upload(screenshotPath, screenshot, { contentType: screenshot.type, cacheControl: '3600', upsert: false });
  if (uploadError) {
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'ادائیگی کی درخواست جمع کریں'; }
    return notice('اسکرین شاٹ اپلوڈ نہیں ہوا: ' + uploadError.message);
  }
  const { error } = await supabase.from('premium_payment_requests').insert({
    user_id: state.user.id, plan_code: plan, amount: amounts[plan],
    payment_method: f.get('payment_method'), transaction_id: null,
    payer_name: String(f.get('payer_name') || '').trim(), screenshot_path: screenshotPath
  });
  if (error) {
    await supabase.storage.from('premium-payment-screenshots').remove([screenshotPath]);
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'ادائیگی کی درخواست جمع کریں'; }
    return notice('ادائیگی جمع نہیں ہوئی: ' + error.message);
  }
  notice(plan.startsWith('agent_') ? 'آپ کی ایجنٹ پیکج ادائیگی کی درخواست موصول ہو گئی ہے۔ رقم کی تصدیق کے بعد ایجنٹ پیکج فعال ہوگا۔' : 'آپ کی ادائیگی کی درخواست موصول ہو گئی ہے۔ تصدیق کے بعد Premium فعال ہو جائے گا۔');
  e.target.reset();
  await loadPremium();
}
async function loadPaymentRequests() {
  if (!state.admin) return;
  const el = $('#adminPayments');
  if (!el) return;
  const { data, error } = await supabase.from('premium_payment_requests').select('*')
    .order('created_at', { ascending: false }).limit(100);
  if (error) { el.textContent = error.message; return; }
  const pending = (data || []).filter(r => r.status === 'pending');
  const paymentCards = await Promise.all(pending.map(async r => {
    const { data: proof } = r.screenshot_path
      ? await supabase.storage.from('premium-payment-screenshots').createSignedUrl(r.screenshot_path, 900)
      : { data: null };
    return `
      <article class="payment-admin-row">
        <div><strong>Rs ${Number(r.amount).toLocaleString('en-PK')} · ${esc(r.plan_code.replace('premium_','').replaceAll('_',' '))}</strong>
        <p>${esc(r.payment_method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash')}</p>
        <small>Sender: ${esc(r.payer_name || '—')} · User: ${esc(r.user_id)} · ${new Date(r.created_at).toLocaleString()}</small>
        ${proof?.signedUrl ? `<a class="payment-proof-link" href="${esc(proof.signedUrl)}" target="_blank" rel="noopener"><img class="payment-proof-thumb" src="${esc(proof.signedUrl)}" alt="Payment screenshot">اسکرین شاٹ دیکھیں</a>` : '<small>اسکرین شاٹ دستیاب نہیں</small>'}</div>
        <div class="actions"><button class="primary" type="button" data-review-payment="${esc(r.id)}" data-approve="true">منظور کریں</button>
        <button class="danger" type="button" data-review-payment="${esc(r.id)}" data-approve="false">مسترد کریں</button></div>
      </article>`;
  }));
  el.innerHTML = '<h3>ایڈمن ادائیگیوں کی تصدیق</h3>' + (paymentCards.length ? paymentCards.join('') : '<div class="empty">کوئی زیرِ تصدیق ادائیگی نہیں۔</div>');
  el.querySelectorAll('[data-review-payment]').forEach(btn => btn.addEventListener('click', async () => {
    if (!state.admin) return notice('صرف ایڈمن ادائیگی منظور کر سکتا ہے۔');
    const approve = btn.dataset.approve === 'true';
    const note = approve ? '' : (prompt('مسترد کرنے کی وجہ (اختیاری):') || '');
    if (!approve && !confirm('کیا آپ اس ادائیگی کو مسترد کرنا چاہتے ہیں؟')) return;
    if (approve && !confirm('کیا آپ نے اپنے EasyPaisa/JazzCash اکاؤنٹ میں رقم وصول ہونے کی تصدیق کر لی ہے؟')) return;
    const { error: reviewError } = await supabase.rpc('review_premium_payment', {
      p_payment_id: btn.dataset.reviewPayment, p_approve: approve, p_note: note
    });
    if (reviewError) return notice('ادائیگی کی تصدیق نہیں ہو سکی: ' + reviewError.message);
    notice(approve ? 'ادائیگی کی درخواست منظور ہو گئی۔' : 'ادائیگی کی درخواست مسترد ہو گئی۔');
    await loadPaymentRequests();
  }));
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
  setAppAccess();
  if ($('#locationStatus')) $('#locationStatus').textContent = 'آپ کے علاقے کی پراپرٹیز تلاش کی جا رہی ہیں…';
  // Do not block the whole app while the browser asks for location permission.
  detectLocation().then(() => {
    if (state.tab === 'search') loadListings();
  }).catch(error => console.warn('Location lookup failed:', error));
  // Refresh the listing cards after login/logout so the comment box appears
  // immediately when the user's authentication state changes.
  supabase.auth.onAuthStateChange(() => {
    setTimeout(async () => {
      await refreshUser();
      setAppAccess();
      if (state.tab === 'search') await loadListings();
      if (state.tab === 'mine') await loadMyListings();
      if (state.tab === 'post') await loadPostLimitStatus();
      if (state.tab === 'premium') await loadPremium();
      if (state.tab === 'admin' && state.admin) await loadAdmin();
    }, 0);
  });
}
start().catch(error => {
  console.error('RENT MATCH startup error:', error);
  if ($('#app')) $('#app').innerHTML = '<div class="panel">ایپ شروع نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔</div>';
});