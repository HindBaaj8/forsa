import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Shield, Star, MapPin, MessageSquare, 
  Wrench, Briefcase, Truck, Laptop, Scissors, BookOpen,
  ChevronRight, Search, Users, CheckCircle, Clock, Phone, Mail,
  ArrowRight, Zap, Award, Target, Heart, Eye, ThumbsUp, 
  Lock, Headphones, Sparkles, Verified, CreditCard, Globe,
  Menu, X
} from 'lucide-react';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking a link
  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    if (path) navigate(path);
  };

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const services = [
    { icon: <Wrench size={28} />, title: 'الصيانة والتركيب', desc: 'كهرباء، سباكة، نجارة، صباغة' },
    { icon: <Laptop size={28} />, title: 'الخدمات الرقمية', desc: 'تصميم، برمجة، تسويق إلكتروني' },
    { icon: <Truck size={28} />, title: 'النقل والتوصيل', desc: 'نقل الأثاث والتوصيل السريع' },
    { icon: <BookOpen size={28} />, title: 'الدروس والتعليم', desc: 'لغات، دعم مدرسي، تكوين مهني' },
    { icon: <Scissors size={28} />, title: 'الحلاقة والتجميل', desc: 'خدمات منزلية احترافية' },
    { icon: <Briefcase size={28} />, title: 'أعمال متنوعة', desc: 'كل الخدمات المهنية اليومية' },
  ];

  const features = [
    { icon: <Shield size={32} />, title: 'أمان وثقة', desc: 'حسابات موثقة وتقييمات حقيقية', color: '#1e3f7a' },
    { icon: <MessageSquare size={32} />, title: 'تواصل مباشر', desc: 'دردشة فورية داخل المنصة', color: '#d4a017' },
    { icon: <MapPin size={32} />, title: 'قريب منك', desc: 'اعثر على مهنيين في مدينتك', color: '#1e3f7a' },
    { icon: <Star size={32} />, title: 'تقييمات شفافة', desc: 'شاهد آراء العملاء قبل الاختيار', color: '#d4a017' },
  ];

  const steps = [
    { num: '01', title: 'إنشاء حساب', desc: 'سجل مجاناً في دقيقة واحدة', icon: <Users size={24} /> },
    { num: '02', title: 'نشر طلب', desc: 'صف الخدمة التي تحتاجها', icon: <Target size={24} /> },
    { num: '03', title: 'اختيار مهني', desc: 'قارن العروض والأسعار', icon: <Award size={24} /> },
    { num: '04', title: 'إنجاز المهمة', desc: 'أنجز العمل وقيّم المهني', icon: <ThumbsUp size={24} /> },
  ];

  const trustItems = [
    { icon: <Verified size={28} />, title: 'مهنيون موثقون', desc: 'جميع المهنيين تم التحقق من هوياتهم', color: '#1e3f7a' },
    { icon: <Lock size={28} />, title: 'مدفوعات آمنة', desc: 'معاملات مشفرة 100%', color: '#d4a017' },
    { icon: <Headphones size={28} />, title: 'دعم سريع', desc: 'فريق دعم متواجد 24/7', color: '#1e3f7a' },
    { icon: <Star size={28} />, title: 'تقييمات حقيقية', desc: 'تقييمات من عملاء حقيقيين', color: '#d4a017' },
  ];

  const testimonials = [
    { name: 'سارة أحمد', role: 'عميلة', text: 'خدمة ممتازة! لقيت أفضل مصمم في وقت قياسي.', rating: 5, initials: 'س', bgColor: '#1e3f7a' },
    { name: 'يوسف العلوي', role: 'مهني', text: 'المنصة ساعدتني نوصل لعدد كبير من العملاء.', rating: 5, initials: 'ي', bgColor: '#d4a017' },
    { name: 'فاطمة الزهراء', role: 'عميلة', text: 'آمنة وسهلة الاستخدام. أنصح بها بشدة.', rating: 4, initials: 'ف', bgColor: '#1e3f7a' },
    { name: 'أحمد البقالي', role: 'مهني', text: 'أفضل منصة للخدمات المهنية في المغرب.', rating: 5, initials: 'أ', bgColor: '#d4a017' },
  ];

  const faqs = [
    { q: 'كيف أبدأ باستخدام المنصة؟', a: 'سجل حسابك مجاناً، ثم ابدأ كنشر طلب أو عرض خدمتك.' },
    { q: 'هل الخدمة مجانية؟', a: 'نعم، التسجيل والاستخدام الأساسي مجاني 100%.' },
    { q: 'كيف أتواصل مع المهنيين؟', a: 'عبر الرسائل المباشرة داخل المنصة.' },
    { q: 'هل الموقع آمن؟', a: 'نعم، جميع المعاملات مشفرة وحسابات موثقة.' },
    { q: 'كيف يتم الدفع؟', a: 'يمكنك الدفع نقداً أو عبر بطاقات الائتمان.' },
    { q: 'ماذا لو لم تعجبني الخدمة؟', a: 'لديك نظام تقييم وشكاوى. فريق الدعم يتوسط لحل المشكلات.' },
  ];

  const stats = [
    { value: '5000+', label: 'مهني نشيط', icon: <Briefcase size={24} /> },
    { value: '12000+', label: 'مهمة منجزة', icon: <CheckCircle size={24} /> },
    { value: '4.8 ★', label: 'تقييم العملاء', icon: <Star size={24} /> },
    { value: '98%', label: 'رضى العملاء', icon: <Heart size={24} /> },
  ];

  const navLinks = [
    { name: 'الرئيسية', id: 'home-hero', action: () => scrollToSection('home-hero') },
    { name: 'الخدمات', id: 'services-section', action: () => scrollToSection('services-section') },
    { name: 'مميزاتنا', id: 'features-section', action: () => scrollToSection('features-section') },
    { name: 'كيف يعمل', id: 'steps-section', action: () => scrollToSection('steps-section') },
    { name: 'آراء العملاء', id: 'testimonials-section', action: () => scrollToSection('testimonials-section') },
  ];

  return (
    <div className="home-page">
      {/* ========== STICKY NAVIGATION MENU (EN HAUT) ========== */}
      <nav className={`premium-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <div className="nav-brand" onClick={() => { scrollToSection('home-hero'); setMobileMenuOpen(false); }}>
            <Briefcase size={28} className="brand-icon" />
            <span className="brand-text">فرصة <span>عمل</span></span>
          </div>

          {/* Desktop Navigation Links */}
          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <button onClick={link.action} className="nav-link-btn">
                  {link.name}
                </button>
              </li>
            ))}
            <li>
              <button className="nav-btn" onClick={() => handleNavClick('/auth?mode=register')}>
                انضم الآن
              </button>
            </li>
            <li>
              <button className="nav-btn-outline" onClick={() => handleNavClick('/auth?mode=login')}>
                تسجيل الدخول
              </button>
            </li>
          </ul>

          {/* Mobile Menu Toggle */}
          <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="home-hero" className="home-hero">
        <div className="home-hero-bg">
          <div className="home-hero-blob1"></div>
          <div className="home-hero-blob2"></div>
        </div>
        <div className="home-container">
          <div className="home-hero-content">
            <div className="home-badge">
              <Zap size={14} />
              <span>منصة مغربية موثوقة</span>
            </div>
            <h1>
              فرص الشغل <span className="text-gold">بين يديك</span>
            </h1>
            <p>
              منصة <strong>فرصة عمل</strong> تجمع المهنيين المغاربة مع العملاء بكل سهولة وأمان.
              ابحث عن الخدمة التي تحتاجها أو اعرض مهارتك لآلاف العملاء.
            </p>
            <div className="home-hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/auth?mode=register')}>
                ابدأ مجاناً <ArrowRight size={18} />
              </button>
              {/* FIXED: Button now scrolls to "كيف يعمل" section instead of broken navigate */}
              <button className="btn-outline" onClick={() => scrollToSection('steps-section')}>
                كيف يعمل الموقع؟
              </button>
            </div>
            <div className="home-stats">
              {stats.map((stat, i) => (
                <div key={i} className="home-stat">
                  <div className="home-stat-icon">{stat.icon}</div>
                  <div>
                    <div className="home-stat-value">{stat.value}</div>
                    <div className="home-stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="home-hero-search">
            <div className="search-wrapper">
              <Search size={20} />
              <input type="text" placeholder="عن أي خدمة تبحث؟ كهربائي، مصمم، سباك..." />
              <button onClick={() => navigate('/client/search')}>بحث</button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services-section" className="home-services">
        <div className="home-container">
          <div className="section-header">
            <span>خدماتنا</span>
            <h2>كل ما تحتاجه في <span className="text-gold">مكان واحد</span></h2>
            <p>تشكيلة واسعة من المهن تغطي جميع احتياجاتك اليومية</p>
          </div>
          <div className="services-grid">
            {services.map((service, i) => (
              <div key={i} className="service-card" onClick={() => navigate('/client/search')}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features-section" className="home-features">
        <div className="home-container">
          <div className="section-header">
            <span>لماذا نحن</span>
            <h2>لماذا تختار <span className="text-gold">فرصة عمل</span>؟</h2>
          </div>
          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="home-trust">
        <div className="home-container">
          <div className="trust-header">
            <div className="trust-badge">
              <Sparkles size={16} />
              <span>لماذا تثق بنا</span>
            </div>
            <h2>منصة موثوقة <span className="text-gold">للجميع</span></h2>
            <p>نضمن لك تجربة آمنة ومريحة</p>
          </div>
          <div className="trust-grid">
            {trustItems.map((item, i) => (
              <div key={i} className="trust-card">
                <div className="trust-icon" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="steps-section" className="home-steps">
        <div className="home-container">
          <div className="section-header">
            <span>كيف يعمل</span>
            <h2>أربع خطوات <span className="text-gold">بسيطة</span></h2>
            <p>تفصلك عن إنجاز مهمتك أو الحصول على شغل جديد</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{step.num}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials-section" className="home-testimonials">
        <div className="home-container">
          <div className="section-header">
            <span>آراء المستخدمين</span>
            <h2>ماذا يقول <span className="text-gold">عملاؤنا</span>؟</h2>
            <p>أكثر من 12000 عميل سعيد</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((item, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-avatar" style={{ backgroundColor: item.bgColor }}>
                  {item.initials}
                </div>
                <div className="testimonial-stars">
                  {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                </div>
                <p className="testimonial-text">"{item.text}"</p>
                <h3>{item.name}</h3>
                <p className="testimonial-role">{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="home-faq">
        <div className="home-container">
          <div className="faq-wrapper">
            <div className="faq-left">
              <div className="faq-badge">
                <MessageSquare size={16} />
                <span>دعم ومساعدة</span>
              </div>
              <h2>الأسئلة <span className="text-gold">الشائعة</span></h2>
              <p>أجوبة على أكثر الأسئلة شيوعاً</p>
              {/* FIXED: Button now scrolls to footer contact section */}
              <button className="btn-outline" onClick={() => scrollToSection('footer-contact-section')}>
                تواصل معنا <ChevronRight size={16} />
              </button>
            </div>
            <div className="faq-right">
              {faqs.map((item, i) => (
                <div key={i} className={`faq-item ${openFaq === i ? 'active' : ''}`}>
                  <button className="faq-question" onClick={() => toggleFaq(i)}>
                    <span>{item.q}</span>
                    <ChevronRight size={18} className={`faq-icon ${openFaq === i ? 'rotated' : ''}`} />
                  </button>
                  <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="home-cta">
        <div className="home-container">
          <h2>ابدأ الآن مجاناً</h2>
          <p>انضم إلى آلاف المستخدمين وابحث عن فرصتك اليوم</p>
          <button className="btn-primary btn-large" onClick={() => navigate('/auth?mode=register')}>
            إنشاء حساب <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER - Added id for contact section scrolling */}
      <footer id="footer-contact-section" className="home-footer">
        <div className="home-container">
          <div className="footer-grid">
            <div className="footer-col brand-col">
              <div className="footer-logo">
                <span className="logo-icon">🔍</span>
                فرصة <span>عمل</span>
              </div>
              <p>منصة مغربية رائدة تربط بين الخدمات المهنية والعملاء بكل سهولة وأمان.</p>
              <div className="footer-social">
                <a href="#" target="_blank" rel="noopener noreferrer">📘 فيسبوك</a>
                <a href="#" target="_blank" rel="noopener noreferrer">📸 إنستغرام</a>
              </div>
            </div>

            <div className="footer-col">
              <h4>روابط سريعة</h4>
              <ul>
                <li><button onClick={() => navigate('/')}>الرئيسية</button></li>
                <li><button onClick={() => navigate('/services')}>الخدمات</button></li>
                <li><button onClick={() => scrollToSection('steps-section')}>كيف يعمل</button></li>
                <li><button onClick={() => navigate('/about')}>من نحن</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>للمستخدمين</h4>
              <ul>
                <li><button onClick={() => navigate('/auth?mode=login')}>تسجيل الدخول</button></li>
                <li><button onClick={() => navigate('/auth?mode=register')}>إنشاء حساب</button></li>
                <li><button onClick={() => navigate('/client/search')}>البحث عن خدمة</button></li>
                <li><button onClick={() => navigate('/worker/services')}>عرض خدمة</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>موارد</h4>
              <ul>
                <li><button onClick={() => navigate('/blog')}>المدونة</button></li>
                <li><button onClick={() => navigate('/faq')}>الأسئلة الشائعة</button></li>
                <li><button onClick={() => navigate('/privacy')}>سياسة الخصوصية</button></li>
                <li><button onClick={() => navigate('/terms')}>شروط الاستخدام</button></li>
              </ul>
            </div>

            <div className="footer-col contact-col">
              <h4>تواصل معنا</h4>
              <ul className="footer-contact">
                <li><Phone size={16} /> 256 103 627  212+    </li>
                <li><Mail size={16} /> forsatamal.app@gmail.com</li>
                <li><MapPin size={16} /> طنجة، المغرب</li>
                <li><Clock size={16} /> دعم 24/7</li>
              </ul>
            </div>
          </div>

          <div className="footer-middle">
            <div className="footer-middle-item">
              <Globe size={16} />
              <span>المغرب</span>
            </div>
            <div className="footer-middle-item">
              <Shield size={16} />
              <span>منصة معتمدة</span>
            </div>
            <div className="footer-middle-item">
              <CreditCard size={16} />
              <span>دفع آمن</span>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} فرصة عمل. جميع الحقوق محفوظة</p>
            <div className="footer-bottom-links">
              <button onClick={() => navigate('/privacy')}>سياسة الخصوصية</button>
              <button onClick={() => navigate('/terms')}>شروط الاستخدام</button>
              <button onClick={() => scrollToSection('footer-contact-section')}>اتصل بنا</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}