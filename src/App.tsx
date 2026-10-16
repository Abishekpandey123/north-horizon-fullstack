import { useEffect, useState, useMemo } from 'react';
import {
  ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronDown,
  Compass, Copy, Download, Globe, GraduationCap, HandHeart, HeartHandshake, HelpCircle,
  LucideIcon, Mail, Menu, MessageSquare, Moon, Mountain, Palette,
  Search, ShieldCheck, Sparkles, Sun, Users, X
} from 'lucide-react';
import { api, type Program, type Announcement, type SubmissionType, type PublicStats } from './lib/api';
import { translations, type Language } from './lib/i18n';

const fallbackPrograms: Program[] = [
  { id: 1, slug: 'education', icon: 'GraduationCap', title: 'Educational Enrichment', title_ne: 'शैक्षिक समृद्धि र छात्रवृत्ति', description: 'Encouraging learning, skill development, practical workshops, mentorship, and expanding access to educational opportunities.', description_ne: 'सिक्ने अवसर, सीप विकास, कार्यशाला, र शैक्षिक पहुँचलाई प्रवर्द्धन गर्ने कार्यक्रमहरू।', detail: 'Scholarships, college preparation, youth tech workshops, language classes, and mentorship pairings.', detail_ne: 'छात्रवृत्ति, कलेज तयारी, युवा प्रविधि कार्यशाला, भाषा कक्षाहरू, र मार्गदर्शन।' },
  { id: 2, slug: 'community', icon: 'HandHeart', title: 'Community Welfare', title_ne: 'सामुदायिक कल्याण र सहयोग', description: 'Connecting individuals and families with needs-based assistance, local community resources, and referral pathways.', description_ne: 'आवश्यकतामा परेका परिवारहरूलाई प्रत्यक्ष सहयोग, स्थानीय स्रोत र आपतकालीन सहायता पुर्याउने।', detail: 'Emergency assistance funds, healthcare navigation, senior companionship, and family stabilization resources.', detail_ne: 'आपतकालीन राहत कोष, स्वास्थ्य सेवा परामर्श, ज्येष्ठ नागरिक सहयोग, र पारिवारिक स्रोतहरू।' },
  { id: 3, slug: 'culture', icon: 'Palette', title: 'Cultural Connection', title_ne: 'सांस्कृतिक पहिचान र कला', description: 'Celebrating cultural identity, heritage preservation, arts, media exhibitions, and multicultural community gatherings.', description_ne: 'सांस्कृतिक पहिचानको उत्सव, सम्पदा संरक्षण, कला तथा सञ्चार प्रदर्शनी र अन्तर-पुस्ता सम्बन्ध।', detail: 'Heritage festivals, traditional music and arts exhibits, intergenerational storytelling, and library archives.', detail_ne: 'सांस्कृतिक मेला, परम्परागत कला प्रदर्शनी, पुस्तान्तरण कथा कार्यक्रम, र अभिलेखालय।' },
  { id: 4, slug: 'outreach', icon: 'Compass', title: 'Outreach & Development', title_ne: 'सम्पर्क, साझेदारी र विकास', description: 'Building bridges through cross-community outreach, civic engagement, organizational collaboration, and leadership development.', description_ne: 'सामुदायिक सम्बन्ध विस्तार, नागरिक सहभागिता, संस्थागत साझेदारी, र नेतृत्व विकास।', detail: 'Nonprofit alliances, youth leadership councils, civic engagement forums, and professional networking.', detail_ne: 'संस्थागत सहकार्य, युवा नेतृत्व मञ्च, नागरिक संवाद, र व्यावसायिक सञ्जाल विस्तार।' }
];

const tiersData = [
  { name: 'Silver', range: '$1,000–$2,499', minAmount: 1000, votes: 1, description: 'A meaningful first step in supporting our mission.' },
  { name: 'Gold', range: '$2,500–$4,999', minAmount: 2500, votes: 3, description: 'A deeper commitment to community initiatives.' },
  { name: 'Diamond', range: '$5,000–$9,999', minAmount: 5000, votes: 5, description: 'For members ready to take a more active role.' },
  { name: 'Elite', range: '$10,000–$24,999', minAmount: 10000, votes: 15, description: 'A significant contribution toward long-term goals.' },
  { name: 'Royal', range: '$25,000+', minAmount: 25000, votes: 25, description: 'A leading contribution in support of our purpose.' }
];

const bylawsArticles = [
  { id: 'art-1', title: 'Article I — Name, Office & Purpose', summary: 'Name: North Horizon Foundation Inc. Principal office: Queens County, NY. Purpose: 501(c)(3) charitable, educational, cultural welfare with special focus on Nepalese/Nepalese-American community.' },
  { id: 'art-2', title: 'Article II — Membership & Voting Tiers', summary: 'Defines 5 contribution tiers (Silver 1 vote to Royal 25 votes), Founding Members (25 votes), annual member meetings, quorum, and voting guidelines.' },
  { id: 'art-3', title: 'Article III — Board of Directors', summary: 'Governing board consisting of 7 to 9 directors overseeing corporate property, budgets, and policies.' },
  { id: 'art-4', title: 'Article IV — Corporate Officers', summary: 'President, Vice-President, Secretary, and Treasurer responsibilities and terms.' },
  { id: 'art-5', title: 'Article V — Conflicts of Interest', summary: 'Mandatory annual conflict disclosures, interested director recusals, and fiduciary accountability.' },
  { id: 'art-6', title: 'Article VI — Fiscal Oversight & Filings', summary: 'Financial books, audit requirements, annual report, and fiscal controls.' },
  { id: 'art-7', title: 'Article VII — Dissolution & Asset Distribution', summary: 'Dedicated disposition of corporate assets exclusively for exempt charitable purposes under IRC 501(c)(3).' }
];

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  HandHeart,
  Palette,
  Compass,
  Sparkles
};

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('nhf_theme') as 'light' | 'dark') || 'light';
  });

  // Language State
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('nhf_lang') as Language) || 'en';
  });
  const t = translations[lang];

  // Mobile Menu & Modals
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bylawsOpen, setBylawsOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Data States
  const [programs, setPrograms] = useState<Program[]>(fallbackPrograms);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<PublicStats>({
    activePrograms: 4,
    activeMembers: 6,
    inquiriesReceived: 12,
    activeInitiatives: 3,
    establishedYear: 2024
  });

  // Tier Calculator State
  const [calcTierIndex, setCalcTierIndex] = useState(2); // Diamond default

  // Inquiry Form State
  const [formType, setFormType] = useState<SubmissionType>('contact');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [tier, setTier] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [formNotice, setFormNotice] = useState<{ kind: 'success' | 'error'; text: string; reference?: string } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // AI Assistant Chat Drawer State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: lang === 'ne'
        ? 'नमस्ते! म नर्थ होराइजन फाउन्डेसनको एआई सहायक हुँ। हाम्रो विधान, सदस्यता तह, कार्यक्रम वा सहयोगबारे केही सोध्न सक्नुहुन्छ।'
        : 'Welcome to North Horizon Foundation! I am your AI assistant grounded in our draft bylaws and mission. Ask me about membership tiers, voting rights, governance, or community programs!'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    'What are the membership contribution tiers?',
    'How does member voting power work?',
    'Tell me about the 4 focus areas',
    'Where is the foundation located?'
  ]);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nhf_theme', theme);
  }, [theme]);

  // Apply Language
  useEffect(() => {
    localStorage.setItem('nhf_lang', lang);
  }, [lang]);

  // Load Data
  useEffect(() => {
    api.getPrograms().then(res => { if (res.programs?.length) setPrograms(res.programs); }).catch(() => {});
    api.getAnnouncements().then(res => { if (res.announcements?.length) setAnnouncements(res.announcements); }).catch(() => {});
    api.getStats().then(setStats).catch(() => {});
  }, []);

  // Global Keyboard Shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setBylawsOpen(false);
        setSelectedAnnouncement(null);
        setSelectedProgram(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle Theme
  function toggleTheme() {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }

  // Toggle Language
  function toggleLang() {
    setLang(prev => (prev === 'en' ? 'ne' : 'en'));
  }

  // Handle Form Submission
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFormNotice(null);
    setCopiedRef(false);

    try {
      const result = await api.submit({
        type: formType,
        name: formName,
        email: formEmail,
        phone: formPhone,
        tier: (formType === 'membership' || formType === 'donation') ? tier : '',
        subject: `Website Inquiry: ${formType}`,
        message
      });

      setFormNotice({
        kind: 'success',
        text: result.message,
        reference: result.reference
      });

      // Clear fields
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setTier('');
      setMessage('');
      setFormType('contact');
    } catch (err) {
      setFormNotice({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Failed to submit inquiry.'
      });
    } finally {
      setBusy(false);
    }
  }

  // Send AI Query
  async function handleAiSend(queryToSend?: string) {
    const query = (queryToSend || aiInput).trim();
    if (!query) return;

    setAiMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!queryToSend) setAiInput('');
    setAiLoading(true);

    try {
      const res = await api.aiAssistant(query);
      setAiMessages(prev => [...prev, { sender: 'bot', text: res.reply }]);
      if (res.suggestions?.length) {
        setAiSuggestions(res.suggestions);
      }
    } catch {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Thank you for your question. North Horizon Foundation Inc. provides 5 voting membership tiers (Silver to Royal), programs in education, welfare, culture, and outreach, and a 7–9 member Board of Directors. Send an inquiry below for specialized follow-up.'
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  // Copy Reference Code
  function copyReference(ref: string) {
    navigator.clipboard.writeText(ref).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 3000);
    });
  }

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    const items: Array<{ category: string; title: string; desc: string; action: () => void }> = [];

    // Programs
    programs.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.title_ne && p.title_ne.includes(q))) {
        items.push({
          category: 'Focus Program',
          title: lang === 'ne' && p.title_ne ? p.title_ne : p.title,
          desc: lang === 'ne' && p.description_ne ? p.description_ne : p.description,
          action: () => {
            setSearchOpen(false);
            setSelectedProgram(p);
          }
        });
      }
    });

    // Bylaws
    bylawsArticles.forEach(a => {
      if (a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)) {
        items.push({
          category: 'Bylaws Section',
          title: a.title,
          desc: a.summary,
          action: () => {
            setSearchOpen(false);
            setBylawsOpen(true);
            setActiveArticle(a.id);
          }
        });
      }
    });

    // Tiers
    tiersData.forEach(t => {
      if (t.name.toLowerCase().includes(q) || t.range.includes(q) || t.description.toLowerCase().includes(q)) {
        items.push({
          category: 'Membership Tier',
          title: `${t.name} Tier (${t.range})`,
          desc: `${t.votes} vote(s) in draft bylaws. ${t.description}`,
          action: () => {
            setSearchOpen(false);
            setFormType('membership');
            setTier(t.name);
            document.getElementById('get-involved')?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    });

    // Announcements
    announcements.forEach(a => {
      if (a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)) {
        items.push({
          category: 'Announcement',
          title: a.title,
          desc: a.summary,
          action: () => {
            setSearchOpen(false);
            setSelectedAnnouncement(a);
          }
        });
      }
    });

    return items;
  }, [searchQuery, programs, announcements, lang]);

  const selectedTier = tiersData[calcTierIndex];

  return (
    <>
      {/* 1. TOPBAR */}
      <div className="topbar">
        <div className="container topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{t.topbarSubtitle}</span>
            <span style={{ color: 'var(--gold-vibrant)' }}>✦</span>
            <span>{t.locationLabel}</span>
          </div>

          <div className="topbar-controls">
            <button className="topbar-btn" type="button" onClick={toggleLang} title="Switch Language">
              <Globe size={13} />
              <span>{lang === 'en' ? 'नेपाली' : 'English'}</span>
            </button>
            <button className="topbar-btn" type="button" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
            <a className="topbar-btn" href="/admin" title="Admin Portal">
              <ShieldCheck size={13} />
              <span>{t.navAdmin}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & NAV */}
      <header className="site-header">
        <div className="container nav-wrap">
          <a className="brand" href="#home" aria-label="North Horizon Foundation home">
            <img src="/logo.jpg" alt="North Horizon Foundation logo" />
            <span className="brand-copy">
              <strong>North Horizon</strong>
              <em>Foundation Inc.</em>
              <small>{t.footerMotto}</small>
            </span>
          </a>

          <div className="nav-actions">
            <button
              className="search-trigger-btn"
              type="button"
              onClick={() => setSearchOpen(true)}
              title="Search website (Ctrl+K)"
            >
              <Search size={14} />
              <span>{lang === 'ne' ? 'खोज्नुहोस्...' : 'Search...'}</span>
              <span className="kbd-shortcut">Ctrl K</span>
            </button>

            <button
              className="menu-toggle"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
              <a href="#about" onClick={() => setMenuOpen(false)}>{t.navAbout}</a>
              <a href="#programs" onClick={() => setMenuOpen(false)}>{t.navPrograms}</a>
              <a href="#membership" onClick={() => setMenuOpen(false)}>{t.navMembership}</a>
              <a href="#governance" onClick={() => setMenuOpen(false)}>{t.navGovernance}</a>
              {announcements.length > 0 && (
                <a href="#news" onClick={() => setMenuOpen(false)}>{t.navNews}</a>
              )}
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setBylawsOpen(true); }}
                style={{ font: 'inherit', color: 'inherit', fontWeight: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {t.navBylaws}
              </button>
              <a className="nav-button" href="#get-involved" onClick={() => setMenuOpen(false)}>
                {t.navGetInvolved} <ArrowUpRight size={15} />
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* 3. HERO SECTION */}
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="hero-content">
              <span className="eyebrow">
                <span className="eyebrow-line" />
                {t.heroEyebrow}
              </span>
              <h1>
                {t.heroHeadingLine1} <span>{t.heroHeadingLine2}</span>
              </h1>
              <p className="hero-lead">{t.heroLead}</p>

              <div className="hero-actions">
                <a className="button button-gold" href="#get-involved">
                  {t.heroBtnPrimary} <ArrowRight size={17} />
                </a>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setBylawsOpen(true)}
                >
                  <BookOpen size={16} /> {t.navBylaws}
                </button>
              </div>

              <div className="hero-note">
                <span className="note-icon"><ShieldCheck size={16} /></span>
                <span>{t.heroPill}</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-logo-halo" />
              <div className="hero-logo-card">
                <img src="/logo.jpg" alt="North Horizon Foundation emblem" />
              </div>
              <div className="floating-pill float-top">
                <span className="float-symbol"><Mountain size={17} /></span>
                <div>
                  <b style={{ fontSize: '11px', display: 'block' }}>{t.heroSharedHorizon}</b>
                  <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.heroSharedHorizonSub}</small>
                </div>
              </div>
              <div className="floating-pill float-bottom">
                <span className="float-symbol green"><Users size={17} /></span>
                <div>
                  <b style={{ fontSize: '11px', display: 'block' }}>{t.heroStrongerTogether}</b>
                  <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.heroStrongerTogetherSub}</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. IMPACT METRICS RIBBON */}
        <section className="metrics-ribbon">
          <div className="container metrics-grid">
            <div className="metric-item">
              <div className="metric-icon"><GraduationCap size={24} /></div>
              <div className="metric-data">
                <b>{stats.activePrograms}</b>
                <span>{t.statPrograms}</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon" style={{ background: 'var(--bg-accent-gold)', color: 'var(--gold-hover)' }}><Users size={24} /></div>
              <div className="metric-data">
                <b>{stats.activeMembers}+</b>
                <span>{t.statMembers}</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon" style={{ background: 'var(--bg-accent-green)', color: 'var(--green-primary)' }}><HandHeart size={24} /></div>
              <div className="metric-data">
                <b>{stats.inquiriesReceived}+</b>
                <span>{t.statInquiries}</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon" style={{ background: 'var(--bg-accent-purple)', color: '#9333ea' }}><Sparkles size={24} /></div>
              <div className="metric-data">
                <b>{stats.establishedYear}</b>
                <span>{t.statYear}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. ABOUT SECTION */}
        <section className="section" id="about">
          <div className="container about-grid">
            <div className="about-banner">
              <span className="eyebrow" style={{ color: '#fef08a' }}>✦ {t.aboutEyebrow}</span>
              <h3>“A brighter future begins when we move forward together.”</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px', fontSize: '12px' }}>
                <span>North Horizon Foundation Inc.</span>
                <span style={{ color: 'var(--gold-vibrant)' }}>Queens County, NY</span>
              </div>
            </div>

            <div className="about-content">
              <span className="eyebrow"><span className="eyebrow-line" />{t.aboutEyebrow}</span>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', margin: '14px 0 18px' }}>{t.aboutHeading}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>{t.aboutP1}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>{t.aboutP2}</p>

              <div className="about-points">
                <div className="about-point">
                  <div className="about-point-icon"><Check size={16} /></div>
                  <div>
                    <b>{t.point1Title}</b>
                    <p>{t.point1Sub}</p>
                  </div>
                </div>
                <div className="about-point">
                  <div className="about-point-icon"><Check size={16} /></div>
                  <div>
                    <b>{t.point2Title}</b>
                    <p>{t.point2Sub}</p>
                  </div>
                </div>
                <div className="about-point">
                  <div className="about-point-icon"><Check size={16} /></div>
                  <div>
                    <b>{t.point3Title}</b>
                    <p>{t.point3Sub}</p>
                  </div>
                </div>
              </div>

              <a className="button button-outline" href="#programs">
                {t.programsEyebrow} <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* 6. FOCUS PROGRAMS */}
        <section className="section section-alt" id="programs">
          <div className="container">
            <div className="section-title">
              <span className="eyebrow"><span className="eyebrow-line" />{t.programsEyebrow}</span>
              <h2>{t.programsTitle}</h2>
              <p>{t.programsDesc}</p>
            </div>

            <div className="programs-grid">
              {programs.map((program) => {
                const IconComponent = iconMap[program.icon] || Sparkles;
                const title = lang === 'ne' && program.title_ne ? program.title_ne : program.title;
                const desc = lang === 'ne' && program.description_ne ? program.description_ne : program.description;
                const detail = lang === 'ne' && program.detail_ne ? program.detail_ne : program.detail;

                return (
                  <article className="program-card" key={program.id || program.slug}>
                    <div className="program-icon-wrap">
                      <IconComponent size={26} strokeWidth={1.8} />
                    </div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    {detail && <div className="program-detail-tag">{detail}</div>}
                    <button
                      type="button"
                      className="button button-ghost button-sm"
                      style={{ justifyContent: 'space-between', paddingInline: '0', marginTop: 'auto' }}
                      onClick={() => setSelectedProgram(program)}
                    >
                      <span>{t.programGetInvolved}</span>
                      <ArrowUpRight size={15} />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. MEMBERSHIP TIERS & INTERACTIVE CALCULATOR */}
        <section className="section" id="membership">
          <div className="container">
            <div className="section-title">
              <span className="eyebrow"><span className="eyebrow-line" />{t.membershipEyebrow}</span>
              <h2>{t.membershipTitle}</h2>
              <p>{t.membershipDesc}</p>
            </div>

            <div className="tiers-grid">
              {tiersData.map((tierItem, index) => {
                const isFeatured = index === 2;
                return (
                  <article className={`tier-card ${isFeatured ? 'tier-featured' : ''}`} key={tierItem.name}>
                    <div className="tier-topline">
                      <span>{tierItem.name}</span>
                      {isFeatured && <span className="tier-badge">POPULAR</span>}
                    </div>
                    <h3>{tierItem.range}</h3>
                    <div className="tier-votes-badge">
                      <Users size={14} />
                      <span>{tierItem.votes} {t.votesLabel}</span>
                    </div>
                    <p>{tierItem.description}</p>
                    <button
                      type="button"
                      className="button button-outline button-sm"
                      onClick={() => {
                        setFormType('membership');
                        setTier(tierItem.name);
                        document.getElementById('get-involved')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {t.inquireAboutTier} {tierItem.name}
                    </button>
                  </article>
                );
              })}
            </div>

            {/* Interactive Tier Calculator */}
            <div className="calculator-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} style={{ color: 'var(--gold-vibrant)' }} />
                <h3 style={{ margin: 0, fontSize: '20px' }}>{t.calculatorTitle}</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '6px 0 0' }}>{t.calculatorDesc}</p>

              <div className="calc-slider-wrap">
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={calcTierIndex}
                  onChange={(e) => setCalcTierIndex(Number(e.target.value))}
                  className="calc-slider"
                  aria-label="Tier selection slider"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {tiersData.map((td, i) => (
                    <span
                      key={td.name}
                      onClick={() => setCalcTierIndex(i)}
                      style={{ cursor: 'pointer', fontWeight: i === calcTierIndex ? '700' : '400', color: i === calcTierIndex ? 'var(--gold-hover)' : 'inherit' }}
                    >
                      {td.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="calc-result-card">
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Selected Tier</span>
                  <h4 style={{ margin: '4px 0 0', fontSize: '22px' }}>{selectedTier.name} — {selectedTier.range}</h4>
                  <small style={{ color: 'var(--text-secondary)' }}>{selectedTier.description}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.calculateVotes}</span>
                  <div style={{ fontSize: '28px', fontFamily: 'var(--font-heading)', color: 'var(--blue-primary)', fontWeight: '700' }}>
                    {selectedTier.votes} Vote{selectedTier.votes > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '18px 0 0', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <ShieldCheck size={16} style={{ flexShrink: 0, color: 'var(--gold-hover)' }} />
                <span>{t.tierDisclaimer}</span>
              </p>
            </div>
          </div>
        </section>

        {/* 8. GOVERNANCE & BYLAWS PREVIEW */}
        <section className="section section-alt" id="governance">
          <div className="container">
            <div className="section-title">
              <span className="eyebrow"><span className="eyebrow-line" />{t.governanceEyebrow}</span>
              <h2>{t.governanceTitle}</h2>
              <p>{t.governanceDesc}</p>
            </div>

            <div className="governance-grid">
              <article className="governance-card">
                <div className="gov-icon-wrap"><ShieldCheck size={24} /></div>
                <div>
                  <h3>Board Oversight (7–9 Members)</h3>
                  <p>Our draft framework establishes fiduciary responsibility with an independent Board of Directors governing programs, finances, and corporate compliance.</p>
                  <span className="gov-tag">Article III — Board Governance</span>
                </div>
              </article>
              <article className="governance-card">
                <div className="gov-icon-wrap" style={{ background: 'var(--bg-accent-gold)', color: 'var(--gold-hover)' }}><BookOpen size={24} /></div>
                <div>
                  <h3>Strict Conflict of Interest Policy</h3>
                  <p>All officers and directors are required to complete annual conflict disclosures with immediate recusal on interested transactions.</p>
                  <span className="gov-tag">Article V — Ethical Integrity</span>
                </div>
              </article>
              <article className="governance-card">
                <div className="gov-icon-wrap" style={{ background: 'var(--bg-accent-green)', color: 'var(--green-primary)' }}><Users size={24} /></div>
                <div>
                  <h3>Voting Member Representation</h3>
                  <p>Eligible members in good standing participate in annual meetings and elect leadership through tiered voting power.</p>
                  <span className="gov-tag">Article II — Member Democracy</span>
                </div>
              </article>
              <article className="governance-card">
                <div className="gov-icon-wrap" style={{ background: 'var(--bg-accent-purple)', color: '#9333ea' }}><HeartHandshake size={24} /></div>
                <div>
                  <h3>Charitable Purpose Inurement Ban</h3>
                  <p>Net earnings exclusively benefit exempt charitable programs with strict prohibition against private inurement or distribution.</p>
                  <span className="gov-tag">Article I & VII — 501(c)(3) Standards</span>
                </div>
              </article>
            </div>

            {/* Bylaws Action Banner */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-accent-blue)', color: 'var(--blue-primary)', display: 'grid', placeItems: 'center' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '18px' }}>{t.bylawsDraftTitle}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{t.bylawsDraftDesc}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setBylawsOpen(true)}
                >
                  <BookOpen size={16} /> {t.openBylawsBtn}
                </button>
                <a
                  className="button button-outline"
                  href="/bylaws-draft.txt"
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  <Download size={16} /> Download Draft
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 9. ANNOUNCEMENTS & NEWS (IF AVAILABLE) */}
        {announcements.length > 0 && (
          <section className="section" id="news">
            <div className="container">
              <div className="section-title">
                <span className="eyebrow"><span className="eyebrow-line" />{t.newsEyebrow}</span>
                <h2>{t.newsTitle}</h2>
                <p>{t.newsDesc}</p>
              </div>

              <div className="announcements-grid">
                {announcements.map((item) => (
                  <article className="announcement-card" key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="announcement-tag">{item.category}</span>
                      <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.date_label}</small>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <button
                      type="button"
                      className="button button-outline button-sm"
                      style={{ marginTop: 'auto' }}
                      onClick={() => setSelectedAnnouncement(item)}
                    >
                      {t.readMore} <ArrowRight size={13} />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 10. GET INVOLVED / INQUIRY FORM */}
        <section className="section section-alt" id="get-involved">
          <div className="container involvement-grid">
            <div>
              <span className="eyebrow"><span className="eyebrow-line" />{t.inquiryEyebrow}</span>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', margin: '14px 0 18px' }}>{t.inquiryTitle}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>{t.inquiryDesc}</p>

              <div style={{ marginTop: '32px', display: 'grid', gap: '18px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-accent-blue)', color: 'var(--blue-primary)', display: 'grid', placeItems: 'center' }}>
                    <Users size={18} />
                  </div>
                  <div>
                    <b style={{ display: 'block', fontSize: '14px' }}>Community Membership</b>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Explore contribution tiers and participate in general assemblies.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-accent-green)', color: 'var(--green-primary)', display: 'grid', placeItems: 'center' }}>
                    <HandHeart size={18} />
                  </div>
                  <div>
                    <b style={{ display: 'block', fontSize: '14px' }}>Volunteer & Mentorship</b>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Contribute your skills to education, welfare, and cultural initiatives.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-accent-gold)', color: 'var(--gold-hover)', display: 'grid', placeItems: 'center' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <b style={{ display: 'block', fontSize: '14px' }}>Direct Communication</b>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reach our administrative committee in Queens County, NY.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* The Form */}
            <form className="inquiry-card" onSubmit={handleSubmit}>
              <h3 style={{ margin: '0 0 8px', fontSize: '24px' }}>Send an Inquiry</h3>
              <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--text-muted)' }}>{t.formPrivacy}</p>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="inq-name">{t.formName} *</label>
                  <input
                    id="inq-name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="form-input"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inq-email">{t.formEmail} *</label>
                  <input
                    id="inq-email"
                    type="email"
                    required
                    maxLength={254}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="form-input"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="inq-phone">{t.formPhone}</label>
                  <input
                    id="inq-phone"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="form-input"
                    placeholder="+1 (718) 555-0100"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inq-type">{t.formType} *</label>
                  <select
                    id="inq-type"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as SubmissionType)}
                    className="form-select"
                  >
                    <option value="contact">General Inquiry</option>
                    <option value="volunteer">Volunteer or Partner</option>
                    <option value="membership">Membership Application</option>
                    <option value="donation">Donation Inquiry</option>
                  </select>
                </div>
              </div>

              {(formType === 'membership' || formType === 'donation') && (
                <div className="form-group">
                  <label htmlFor="inq-tier">{t.formTier}</label>
                  <select
                    id="inq-tier"
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Not decided yet</option>
                    <option value="Silver">Silver ($1,000–$2,499 · 1 vote)</option>
                    <option value="Gold">Gold ($2,500–$4,999 · 3 votes)</option>
                    <option value="Diamond">Diamond ($5,000–$9,999 · 5 votes)</option>
                    <option value="Elite">Elite ($10,000–$24,999 · 15 votes)</option>
                    <option value="Royal">Royal ($25,000+ · 25 votes)</option>
                    <option value="Founding Member">Founding Member (25 votes)</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="inq-message">{t.formMessage} *</label>
                <textarea
                  id="inq-message"
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-textarea"
                  placeholder="Share your background, question, or how you would like to collaborate..."
                />
              </div>

              {formNotice && (
                <div className={`form-feedback ${formNotice.kind}`}>
                  {formNotice.kind === 'success' ? <CheckCircle2 size={18} /> : <HelpCircle size={18} />}
                  <div style={{ flex: 1 }}>
                    <div>{formNotice.text}</div>
                    {formNotice.reference && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>
                          Ref: {formNotice.reference}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyReference(formNotice.reference!)}
                          className="button button-outline button-sm"
                          style={{ padding: '2px 8px', fontSize: '10px' }}
                        >
                          <Copy size={11} /> {copiedRef ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="button button-primary"
                style={{ width: '100%', padding: '14px', marginTop: '6px' }}
              >
                {busy ? t.formSubmitting : t.formSubmit} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* 11. FOOTER */}
      <footer className="site-footer" id="contact">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a className="brand" href="#home" style={{ marginBottom: '16px' }}>
                <img src="/logo.jpg" alt="Logo" style={{ width: '48px', height: '48px' }} />
                <span className="brand-copy">
                  <strong style={{ color: '#fff' }}>North Horizon</strong>
                  <em style={{ color: 'var(--gold-vibrant)' }}>Foundation Inc.</em>
                </span>
              </a>
              <p style={{ fontSize: '13px', lineHeight: '1.6', maxWidth: '320px' }}>
                Promoting community welfare, cultural preservation, and educational enrichment through dedicated public service in Queens County, NY.
              </p>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--gold-vibrant)' }}>
                Together for a Brighter Future ✦
              </span>
            </div>

            <div className="footer-col">
              <h4>Organization</h4>
              <a href="#about">{t.navAbout}</a>
              <a href="#programs">{t.navPrograms}</a>
              <a href="#membership">{t.navMembership}</a>
              <a href="#governance">{t.navGovernance}</a>
              <button
                type="button"
                onClick={() => setBylawsOpen(true)}
                style={{ color: 'inherit', font: 'inherit', fontSize: '13px', padding: 0, margin: '0 0 12px', display: 'block', textAlign: 'left' }}
              >
                {t.navBylaws}
              </button>
            </div>

            <div className="footer-col">
              <h4>Get Involved</h4>
              <a href="#get-involved">Volunteer Opportunities</a>
              <a href="#get-involved">Membership Application</a>
              <a href="#get-involved">Donation Inquiries</a>
              <a href="#get-involved">General Contact</a>
            </div>

            <div className="footer-col">
              <h4>Administration</h4>
              <a href="/admin">Staff Admin Portal</a>
              <a href="/bylaws-draft.txt" target="_blank" rel="noreferrer">Direct Bylaws File</a>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                style={{ color: 'inherit', font: 'inherit', fontSize: '13px', padding: 0, margin: '0 0 12px', display: 'block', textAlign: 'left' }}
              >
                Search Knowledge Base
              </button>
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                style={{ color: 'inherit', font: 'inherit', fontSize: '13px', padding: 0, margin: '0 0 12px', display: 'block', textAlign: 'left' }}
              >
                Horizon AI Assistant
              </button>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {t.footerRights}</span>
            <span>Queens County, New York · 501(c)(3) Candidate Organization</span>
          </div>
        </div>
      </footer>

      {/* 12. FLOATING AI ASSISTANT DRAWER */}
      <button
        type="button"
        className="ai-assistant-toggle"
        onClick={() => setAiOpen(!aiOpen)}
        aria-label="Open Horizon AI Assistant"
      >
        <MessageSquare size={18} />
        <span>{t.aiTitle}</span>
      </button>

      {aiOpen && (
        <div className="ai-assistant-drawer" role="dialog" aria-label="AI Assistant Dialog">
          <div className="ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} style={{ color: 'var(--gold-vibrant)' }} />
              <div>
                <b style={{ fontSize: '14px', display: 'block' }}>{t.aiTitle}</b>
                <small style={{ fontSize: '10px', color: '#93c5fd' }}>Bylaws & Mission AI</small>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAiOpen(false)}
              style={{ color: '#fff', padding: '4px' }}
              aria-label="Close Assistant"
            >
              <X size={18} />
            </button>
          </div>

          <div className="ai-chat-body">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
              </div>
            ))}
            {aiLoading && (
              <div className="chat-bubble bot" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                Thinking and consulting bylaws...
              </div>
            )}

            {aiSuggestions.length > 0 && !aiLoading && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  {t.aiSuggested}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {aiSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ai-prompt-chip"
                      onClick={() => handleAiSend(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            className="ai-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleAiSend();
            }}
          >
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder={t.aiPromptPlaceholder}
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '12px' }}
            />
            <button
              type="submit"
              disabled={aiLoading || !aiInput.trim()}
              className="button button-primary"
              style={{ padding: '8px 14px', fontSize: '12px' }}
            >
              {t.aiSend}
            </button>
          </form>
        </div>
      )}

      {/* 13. GLOBAL SEARCH MODAL (Ctrl+K) */}
      {searchOpen && (
        <div className="modal-overlay" onClick={() => setSearchOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.globalSearchPlaceholder}
                  className="form-input"
                  style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '0', fontSize: '15px' }}
                />
              </div>
              <button type="button" onClick={() => setSearchOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '50vh' }}>
              {!searchQuery.trim() ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                  Type to search across focus areas, bylaws sections, membership tiers, and announcements.
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                  No matching items found for "{searchQuery}".
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={item.action}
                      style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <b style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{item.title}</b>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-hover)', fontWeight: '700' }}>
                          {item.category}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Press <b>Esc</b> to close</span>
              <span>{searchResults.length} result(s)</span>
            </div>
          </div>
        </div>
      )}

      {/* 14. INTERACTIVE BYLAWS MODAL */}
      {bylawsOpen && (
        <div className="modal-overlay" onClick={() => setBylawsOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} style={{ color: 'var(--blue-primary)' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>North Horizon Foundation Inc. — Draft Bylaws</h3>
                  <small style={{ color: 'var(--text-muted)' }}>A New York Charitable Not-for-Profit Corporation</small>
                </div>
              </div>
              <button type="button" onClick={() => setBylawsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh' }}>
              <div style={{ marginBottom: '18px', padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <b>Summary Guide:</b> These draft bylaws govern organizational purpose, 5-tier member voting rights (Silver to Royal), Board oversight (7–9 directors), conflict-of-interest procedures, and dissolution rules.
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                {bylawsArticles.map((art) => {
                  const isExpanded = activeArticle === art.id;
                  return (
                    <div
                      key={art.id}
                      style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', background: isExpanded ? 'var(--bg-subtle)' : 'var(--bg-surface)' }}
                    >
                      <div
                        onClick={() => setActiveArticle(isExpanded ? null : art.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <b style={{ fontSize: '15px' }}>{art.title}</b>
                        <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        {art.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <a
                className="button button-outline button-sm"
                href="/bylaws-draft.txt"
                target="_blank"
                rel="noreferrer"
                download
              >
                <Download size={14} /> Download Plain Text (.txt)
              </a>
              <button
                type="button"
                className="button button-primary button-sm"
                onClick={() => setBylawsOpen(false)}
              >
                {t.closeBylawsBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 15. PROGRAM DETAIL MODAL */}
      {selectedProgram && (
        <div className="modal-overlay" onClick={() => setSelectedProgram(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{lang === 'ne' && selectedProgram.title_ne ? selectedProgram.title_ne : selectedProgram.title}</h3>
              <button type="button" onClick={() => setSelectedProgram(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                {lang === 'ne' && selectedProgram.description_ne ? selectedProgram.description_ne : selectedProgram.description}
              </p>
              <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <b style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Initiative Details & Scope:</b>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {lang === 'ne' && selectedProgram.detail_ne ? selectedProgram.detail_ne : selectedProgram.detail}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setSelectedProgram(null);
                  setFormType('volunteer');
                  document.getElementById('get-involved')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get Involved in this Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 16. ANNOUNCEMENT DETAIL MODAL */}
      {selectedAnnouncement && (
        <div className="modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="announcement-tag">{selectedAnnouncement.category}</span>
                <h3 style={{ margin: '6px 0 0' }}>{selectedAnnouncement.title}</h3>
              </div>
              <button type="button" onClick={() => setSelectedAnnouncement(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
                {selectedAnnouncement.date_label}
              </small>
              <p style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' }}>
                {selectedAnnouncement.summary}
              </p>
              <div style={{ marginTop: '14px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                {selectedAnnouncement.content}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="button button-outline" onClick={() => setSelectedAnnouncement(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
