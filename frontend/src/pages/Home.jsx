// pages/Home.jsx
import { useNavigate, Link } from 'react-router-dom';
// src/pages/Home.jsx
// غير هذا السطر:
import Navbar from '../components/layout/Navbar';  // ✅ من layout مش common
import {
  ShieldCheck,
  Star,
  MapPin,
  MessageCircle,
  Wrench,
  Briefcase,
  Truck,
  Laptop,
  Scissors,
  BookOpen,
  ArrowLeft,
  Home as HomeIcon,
  Users,
  CheckCircle,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';

import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();

  const services = [
    { icon: <Wrench size={30} />, title: 'الصيانة والتركيب', desc: 'كهرباء، سباكة، نجارة، صباغة' },
    { icon: <Laptop size={30} />, title: 'الخدمات الرقمية', desc: 'تصميم، برمجة، تسويق إلكتروني' },
    { icon: <Truck size={30} />, title: 'النقل والتوصيل', desc: 'نقل الأثاث والتوصيل' },
    { icon: <BookOpen size={30} />, title: 'الدروس والتعليم', desc: 'لغات، دعم، تكوين مهني' },
    { icon: <Scissors size={30} />, title: 'الحلاقة والتجميل', desc: 'خدمات منزلية احترافية' },
    { icon: <Briefcase size={30} />, title: 'أعمال متنوعة', desc: 'كل الخدمات المهنية اليومية' },
  ];

  const testimonials = [
    { name: 'سارة', text: 'لقيت مصمم محترف فـ أقل من ساعة، التجربة كانت ممتازة.', rating: 5 },
    { name: 'يوسف', text: 'أول مرة نخدم عبر منصة منظمة وآمنة بهاد الشكل.', rating: 5 },
    { name: 'حمزة', text: 'الرسائل والتقييمات سهلوا عليا اختيار المهني المناسب.', rating: 4 },
  ];

  const faq = [
    { q: 'كيفاش نخدم فالموقع؟', a: 'سجل حسابك، نشر طلب أو قدم خدمة، وتواصل مباشرة مع المهنيين أو العملاء.' },
    { q: 'واش الموقع آمن؟', a: 'نعم، جميع الحسابات محمية مع نظام تقييم وتبليغ، وبياناتك مشفرة بالكامل.' },
    { q: 'واش التسجيل مجاني؟', a: 'نعم، التسجيل واستعمال المنصة مجاني 100% لكل المستخدمين.' },
    { q: 'كيفاش ندفع للمهني؟', a: 'يمكنك الاتفاق مع المهني مباشرة، المنصة توفر وسائل تواصل آمنة.' },
  ];

  const CARDS = [
    { cls: 'prof-card--1', emoji: '👨‍🔧', bg: '#eef4fc', name: 'محمد أمين', role: 'كهربائي معتمد', stars: '⭐ 4.9', tags: ['كهرباء', 'تركيب'], price: '150 درهم/ساعة' },
    { cls: 'prof-card--2', emoji: '👩‍💻', bg: '#fefaee', name: 'سلمى الإدريسي', role: 'مصممة جرافيك', stars: '⭐ 5.0', tags: ['تصميم', 'فيغما'], price: '200 درهم/ساعة' },
    { cls: 'prof-card--3', emoji: '🍳', bg: '#f0fdf4', name: 'يوسف البلال', role: 'طباخ منزلي', stars: '⭐ 4.8', tags: ['طبخ', 'حفلات'], price: '120 درهم/ساعة' },
  ];

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
            <div className="hero__badge">
              <span className="hero__badge-pulse" />
              منصة مغربية موثوقة ١٠٠٪
            </div>

            <h1 className="hero__title">
              <span className="hero__title-navy">فرص الشغل</span><br />
              <span className="hero__title-gold">بين يديك</span>
            </h1>

            <p className="hero__desc">
              منصة <strong>فرصة عمل</strong> تجمع المهنيين المغاربة مع العملاء بكل سهولة وأمان.
              ابحث عن الخدمة التي تحتاجها أو اعرض مهارتك لآلاف العملاء.
            </p>

            <div className="hero__actions">
              <button className="btn-hero-gold" onClick={() => navigate('/auth?mode=register')}>
                ابدأ مجاناً ←
              </button>
              <button className="btn-hero-outline" onClick={() => navigate('/how-it-works')}>
                كيف يعمل الموقع؟
              </button>
            </div>

            <div className="hero__stats">
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
            {CARDS.map((c) => (
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
          <button className="search-box__btn" onClick={() => navigate('/client/search')}>بحث</button>
        </div>
      </div>

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="section-head">
          <span>الخدمات</span>
          <h2>كل ما تحتاجه في <span className="gold">مكان واحد</span></h2>
          <p className="sec-desc">تشكيلة واسعة من المهن تغطي جميع احتياجاتك اليومية</p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div className="service-card" key={service.title}>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="why-us" id="why-us">
        <div className="section-head">
          <span>لماذا نحن</span>
          <h2>لماذا تختار <span className="navy">فرصة عمل</span>؟</h2>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <ShieldCheck size={32} />
            <h3>أمان وثقة</h3>
            <p>حسابات موثقة وتقييمات حقيقية.</p>
          </div>
          <div className="why-card">
            <MessageCircle size={32} />
            <h3>تواصل مباشر</h3>
            <p>دردشة فورية داخل المنصة.</p>
          </div>
          <div className="why-card">
            <MapPin size={32} />
            <h3>قريب منك</h3>
            <p>اعثر على مهنيين في مدينتك.</p>
          </div>
          <div className="why-card">
            <Star size={32} />
            <h3>تقييمات شفافة</h3>
            <p>شاهد آراء العملاء قبل الاختيار.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-head">
          <span>كيف يعمل</span>
          <h2>٤ خطوات <span className="gold">بسيطة</span></h2>
          <p className="sec-desc">تفصلك عن إنجاز مهمتك أو الحصول على شغل جديد</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">١</div>
            <div className="step-title">أنشئ حسابك</div>
            <p className="step-desc">سجّل كعميل أو صاحب مهنة في دقيقتين</p>
          </div>
          <div className="step-card">
            <div className="step-num">٢</div>
            <div className="step-title">انشر أو ابحث</div>
            <p className="step-desc">العميل ينشر طلبه، والمهني يقدم عرضه</p>
          </div>
          <div className="step-card">
            <div className="step-num">٣</div>
            <div className="step-title">اختر وتواصل</div>
            <p className="step-desc">قارن العروض وتواصل مباشرة</p>
          </div>
          <div className="step-card">
            <div className="step-num">٤</div>
            <div className="step-title">أنجز وقيّم</div>
            <p className="step-desc">أنجز المهمة واستلم أجرك</p>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="section-head">
          <span>من نحن</span>
          <h2>منصة <span className="gold">فرصة عمل</span></h2>
          <p className="sec-desc">منصة مغربية 100% تجمع الخدمات المهنية والعملاء في مكان واحد</p>
        </div>
        <div className="about-content">
          <div className="about-text">
            <p>فرصة عمل هي منصة إلكترونية مغربية تهدف إلى تسهيل التواصل بين أصحاب المهن والعملاء. نقدم حلولاً مبتكرة وسريعة لتلبية احتياجاتكم اليومية.</p>
            <p>نسعى لخلق بيئة آمنة وموثوقة تساهم في تطوير القطاع المهني بالمغرب من خلال التكنولوجيا.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="section-head">
          <span>آراء المستخدمين</span>
          <h2>ماذا يقول عملاؤنا؟</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <div className="testimonial-card" key={item.name}>
              <div className="testimonial-avatar">{item.name.charAt(0)}</div>
              <h3>{item.name}</h3>
              <div className="testimonial-stars">
                {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
              </div>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="section-head">
          <span>الأسئلة الشائعة</span>
          <h2>كل ما تحتاج معرفته</h2>
        </div>

        <div className="faq-list">
          {faq.map((item) => (
            <div className="faq-item" key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>ابدأ الآن مجاناً</h2>
        <p>انضم إلى آلاف المستخدمين وابحث عن فرصتك اليوم.</p>
        <button className="btn-primary" onClick={() => navigate('/auth?mode=register')}>
          إنشاء حساب
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Column 1 - Brand */}
            <div className="footer-col">
              <div className="footer-logo">فرصة <span>عمل</span></div>
              <p className="footer-desc">
                منصة مغربية تربط بين أصحاب المهن والعملاء بكل سهولة وأمان.
              </p>
              <div className="footer-social">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-text">Facebook</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-text">Twitter</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-text">Instagram</a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-text">LinkedIn</a>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div className="footer-col">
              <h4>روابط سريعة</h4>
              <ul>
                <li><Link to="/">الرئيسية</Link></li>
                <li><Link to="/services">الخدمات</Link></li>
                <li><Link to="/how-it-works">كيف يعمل</Link></li>
                <li><Link to="/about">من نحن</Link></li>
              </ul>
            </div>

            {/* Column 3 - For Users */}
            <div className="footer-col">
              <h4>للمستخدمين</h4>
              <ul>
                <li><Link to="/auth?mode=login">تسجيل الدخول</Link></li>
                <li><Link to="/auth?mode=register">إنشاء حساب</Link></li>
                <li><Link to="/client/search">البحث عن خدمة</Link></li>
                <li><Link to="/worker/services">عرض خدمة</Link></li>
              </ul>
            </div>

            {/* Column 4 - Contact */}
            <div className="footer-col">
              <h4>تواصل معنا</h4>
              <ul className="footer-contact">
                <li><Phone size={16} /> +212 5XX XXX XXX</li>
                <li><Mail size={16} /> contact@forsa.ma</li>
                <li><MapPin size={16} /> الدار البيضاء، المغرب</li>
              </ul>
            </div>

            {/* Column 5 - Stats */}
            <div className="footer-col">
              <h4>إحصائيات المنصة</h4>
              <div className="footer-stats">
                <div><HomeIcon size={16} /> <span>+5000 مهني</span></div>
                <div><CheckCircle size={16} /> <span>+12000 خدمة</span></div>
                <div><Users size={16} /> <span>+8000 عميل</span></div>
                <div><Clock size={16} /> <span>دعم 24/7</span></div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} فرصة عمل. جميع الحقوق محفوظة</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">سياسة الخصوصية</Link>
              <Link to="/terms">شروط الاستخدام</Link>
              <Link to="/contact">اتصل بنا</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}