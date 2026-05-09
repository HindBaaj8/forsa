import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import '../styles/Home.css';

const SERVICES = [
  { icon: '🏠', title: 'الأعمال المنزلية',   desc: 'تنظيف، طبخ، رعاية الأطفال والمسنين' },
  { icon: '🔧', title: 'الصيانة والتركيب',   desc: 'كهرباء، سباكة، نجارة، صباغة' },
  { icon: '💻', title: 'الخدمات الرقمية',    desc: 'تصميم، برمجة، تسويق إلكتروني' },
  { icon: '🚚', title: 'النقل والتوصيل',     desc: 'نقل الأثاث وتوصيل الطلبات' },
  { icon: '📚', title: 'الدروس والتعليم',    desc: 'دعم مدرسي، لغات، تكوين مهني' },
  { icon: '✂️', title: 'الحلاقة والتجميل',  desc: 'خدمات الحلاقة والعناية بالمنزل' },
];

const STEPS = [
  { n: '١', title: 'أنشئ حسابك',    desc: 'سجّل كعميل أو صاحب مهنة في دقيقتين' },
  { n: '٢', title: 'انشر أو ابحث', desc: 'العميل ينشر طلبه، والمهني يقدم عرضه' },
  { n: '٣', title: 'اختر وتواصل',  desc: 'قارن العروض وتواصل مباشرة' },
  { n: '٤', title: 'أنجز وقيّم',   desc: 'أنجز المهمة واستلم أجرك' },
];

const WHY = [
  { icon: '✅', t: 'مهنيون موثوقون',   d: 'جميع المهنيين موثقون ومقيّمون من طرف العملاء' },
  { icon: '💬', t: 'تواصل مباشر وآمن', d: 'راسل المهني مباشرة من داخل المنصة بأمان' },
  { icon: '📍', t: 'قريب منك',         d: 'ابحث عن الخدمات المتاحة في مدينتك' },
  { icon: '🌟', t: 'تقييمات شفافة',   d: 'اقرأ آراء العملاء الحقيقيين قبل الاختيار' },
  { icon: '🔒', t: 'بياناتك محمية',   d: 'أمان تام لجميع معلوماتك الشخصية' },
];

const CARDS = [
  { cls: 'prof-card--1', emoji: '👨‍🔧', bg: '#eef4fc', name: 'محمد أمين',     role: 'كهربائي معتمد',  stars: '⭐ 4.9', tags: ['كهرباء','تركيب'],   price: '150 درهم/ساعة' },
  { cls: 'prof-card--2', emoji: '👩‍💻', bg: '#fefaee', name: 'سلمى الإدريسي', role: 'مصممة جرافيك',  stars: '⭐ 5.0', tags: ['تصميم','فيغما'],     price: '200 درهم/ساعة' },
  { cls: 'prof-card--3', emoji: '🍳',   bg: '#f0fdf4', name: 'يوسف البلال',   role: 'طباخ منزلي',    stars: '⭐ 4.8', tags: ['طبخ','حفلات'],      price: '120 درهم/ساعة' },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero__blobs">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__blob hero__blob--3" />
        </div>
        <div className="hero__inner">
          <div className="hero__content">
            <div className="hero__badge au">
              <span className="hero__badge-pulse" />
              منصة مغربية موثوقة ١٠٠٪
            </div>
            <h1 className="hero__title au1">
              <span className="hero__title-navy">فرص الشغل</span><br />
              <span className="hero__title-gold">بين يديك</span>
            </h1>
            <p className="hero__desc au2">
              منصة <strong>فرصة عمل</strong> تجمع المهنيين المغاربة مع العملاء بكل سهولة وأمان.
              ابحث عن الخدمة التي تحتاجها أو اعرض مهارتك لآلاف العملاء.
            </p>
            <div className="hero__actions au3">
              <button className="btn-hero-gold" onClick={() => navigate('/auth?mode=register')}>
                ابدأ مجاناً ←
              </button>
              <button className="btn-hero-outline" onClick={() => navigate('/how-it-works')}>
                كيف يعمل الموقع؟
              </button>
            </div>
            <div className="hero__stats au4">
              <div className="hero__stat">
                <div className="hero__stat-num">+٥٠٠٠</div>
                <div className="hero__stat-lbl">مهني نشيط</div>
              </div>
              <div className="hero__stat">
                <div className="hero__stat-num">+١٢٠٠٠</div>
                <div className="hero__stat-lbl">مهمة منجزة</div>
              </div>
              <div className="hero__stat">
                <div className="hero__stat-num">٤.٨ ★</div>
                <div className="hero__stat-lbl">تقييم العملاء</div>
              </div>
            </div>
          </div>

          {/* بطاقات عائمة */}
          <div className="hero__visual">
            {CARDS.map(c => (
              <div key={c.name} className={`prof-card ${c.cls}`}>
                <div className="prof-card__top">
                  <div className="prof-card__av" style={{ background: c.bg }}>{c.emoji}</div>
                  <div>
                    <div className="prof-card__name">{c.name}</div>
                    <div className="prof-card__role">{c.role}</div>
                  </div>
                  <div className="prof-card__stars">{c.stars}</div>
                </div>
                <div className="prof-card__tags">
                  {c.tags.map(t => <span key={t} className="prof-tag">{t}</span>)}
                  <span className="prof-price">{c.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <div className="search-wrap">
        <div className="search-box">
          <span className="search-box__icon">🔍</span>
          <input className="search-box__input" placeholder="عن أي خدمة تبحث؟  مثال: كهربائي، مصمم..." />
          <button className="search-box__btn">بحث</button>
        </div>
      </div>

      {/* SERVICES */}
      <section style={{ background: 'var(--white)', padding: '72px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span className="sec-eye">الخدمات</span>
            <h2 className="sec-title" style={{ marginTop: 10 }}>
              كل ما تحتاجه في <span className="gold">مكان واحد</span>
            </h2>
            <p className="sec-desc" style={{ margin: '8px auto 0' }}>
              تشكيلة واسعة من المهن تغطي جميع احتياجاتك اليومية
            </p>
          </div>
          <div className="services-grid">
            {SERVICES.map(s => (
              <div key={s.title} className="svc-card">
                <div className="svc-icon">{s.icon}</div>
                <div className="svc-title">{s.title}</div>
                <p className="svc-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: 'var(--bg)', padding: '72px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span className="sec-eye sec-eye--gold">كيف يعمل</span>
            <h2 className="sec-title" style={{ marginTop: 10 }}>
              ٤ خطوات <span className="gold">بسيطة</span>
            </h2>
            <p className="sec-desc" style={{ margin: '8px auto 0' }}>
              تفصلك عن إنجاز مهمتك أو الحصول على شغل جديد
            </p>
          </div>
          <div className="steps-grid">
            {STEPS.map(s => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ background: 'var(--white)', padding: '72px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="why-inner">
            <div>
              <span className="sec-eye">لماذا نحن</span>
              <h2 className="sec-title" style={{ marginTop: 10 }}>
                منصة بُنيت <span className="navy">للمغاربة</span>
              </h2>
              <p className="sec-desc">سهولة الاستخدام وأمان البيانات وقرب الخدمة</p>
              <div className="why-list">
                {WHY.map(w => (
                  <div key={w.t} className="why-item">
                    <div className="why-icon">{w.icon}</div>
                    <div>
                      <div className="why-item__title">{w.t}</div>
                      <div className="why-item__desc">{w.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="why-cards">
              {[
                { icon:'🛡️', t:'أمان كامل',    d:'بياناتك محمية ومشفرة' },
                { icon:'⭐', t:'جودة مضمونة', d:'تقييمات حقيقية من عملاء' },
                { icon:'📍', t:'قريب منك',    d:'خدمات في مدينتك' },
                { icon:'💬', t:'دعم ٢٤/٧',   d:'فريقنا دائماً معك' },
              ].map(c => (
                <div key={c.t} className="why-mini">
                  <div className="why-mini__icon">{c.icon}</div>
                  <div className="why-mini__title">{c.t}</div>
                  <div className="why-mini__desc">{c.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-wrap">
        <div className="cta-box">
          <div className="cta-gold-line" />
          <h2 className="cta-title">مستعد للبدء؟</h2>
          <p className="cta-desc">انضم لآلاف المغاربة الذين يستعملون فرصة عمل يومياً</p>
          <div className="cta-actions">
            <button className="btn-cta-gold" onClick={() => navigate('/auth?mode=register')}>
              إنشاء حساب مجاني
            </button>
            <button className="btn-cta-white" onClick={() => navigate('/auth?mode=login')}>
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__logo">فرصة <span className="footer__logo-gold">عمل</span></div>
          <div className="footer__links">
            {['من نحن','الخدمات','كيف يعمل','تواصل معنا'].map(l => (
              <button key={l} className="footer__link">{l}</button>
            ))}
          </div>
        </div>
        <div className="footer__copy">© {new Date().getFullYear()} فرصة عمل — جميع الحقوق محفوظة</div>
      </footer>
    </>
  );
}
