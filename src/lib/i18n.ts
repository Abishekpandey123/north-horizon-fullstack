export type Language = 'en' | 'ne';

export interface Translations {
  // Topbar & Nav
  topbarSubtitle: string;
  locationLabel: string;
  navAbout: string;
  navPrograms: string;
  navMembership: string;
  navGovernance: string;
  navNews: string;
  navBylaws: string;
  navGetInvolved: string;
  navAdmin: string;
  globalSearchPlaceholder: string;
  
  // Hero
  heroEyebrow: string;
  heroHeadingLine1: string;
  heroHeadingLine2: string;
  heroLead: string;
  heroBtnPrimary: string;
  heroBtnSecondary: string;
  heroPill: string;
  heroSharedHorizon: string;
  heroSharedHorizonSub: string;
  heroStrongerTogether: string;
  heroStrongerTogetherSub: string;

  // Impact Stats
  statPrograms: string;
  statMembers: string;
  statInquiries: string;
  statYear: string;

  // About
  aboutEyebrow: string;
  aboutHeading: string;
  aboutP1: string;
  aboutP2: string;
  point1Title: string;
  point1Sub: string;
  point2Title: string;
  point2Sub: string;
  point3Title: string;
  point3Sub: string;

  // Focus Programs
  programsEyebrow: string;
  programsTitle: string;
  programsDesc: string;
  programGetInvolved: string;

  // Membership & Tiers
  membershipEyebrow: string;
  membershipTitle: string;
  membershipDesc: string;
  votesLabel: string;
  inquireAboutTier: string;
  tierDisclaimer: string;
  calculatorTitle: string;
  calculatorDesc: string;
  calculateVotes: string;

  // Governance & Bylaws
  governanceEyebrow: string;
  governanceTitle: string;
  governanceDesc: string;
  bylawsDraftTitle: string;
  bylawsDraftDesc: string;
  openBylawsBtn: string;
  closeBylawsBtn: string;

  // News / Announcements
  newsEyebrow: string;
  newsTitle: string;
  newsDesc: string;
  readMore: string;

  // Inquiry Form
  inquiryEyebrow: string;
  inquiryTitle: string;
  inquiryDesc: string;
  formName: string;
  formEmail: string;
  formPhone: string;
  formType: string;
  formTier: string;
  formMessage: string;
  formSubmit: string;
  formSubmitting: string;
  formPrivacy: string;

  // AI Assistant
  aiTitle: string;
  aiSubtitle: string;
  aiPromptPlaceholder: string;
  aiSend: string;
  aiSuggested: string;

  // Footer
  footerMotto: string;
  footerRights: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    topbarSubtitle: 'COMMUNITY · CULTURE · OPPORTUNITY',
    locationLabel: 'Queens County, New York',
    navAbout: 'About',
    navPrograms: 'Focus Areas',
    navMembership: 'Membership',
    navGovernance: 'Governance',
    navNews: 'Announcements',
    navBylaws: 'Bylaws Draft',
    navGetInvolved: 'Get Involved',
    navAdmin: 'Admin Portal',
    globalSearchPlaceholder: 'Search programs, bylaws, tiers, news...',

    heroEyebrow: 'A Community with a Shared Horizon',
    heroHeadingLine1: 'Together, we build a',
    heroHeadingLine2: 'brighter future.',
    heroLead: 'Creating pathways to opportunity through educational enrichment, cultural preservation, community welfare, and dedicated public service.',
    heroBtnPrimary: 'Be Part of the Journey',
    heroBtnSecondary: 'Discover Our Mission',
    heroPill: 'Purpose-led. Community-centered. Built on shared responsibility.',
    heroSharedHorizon: 'One shared horizon',
    heroSharedHorizonSub: 'Many ways to make a lasting difference',
    heroStrongerTogether: 'Stronger together',
    heroStrongerTogetherSub: 'People at the heart of our mission',

    statPrograms: 'Focus Programs',
    statMembers: 'Active Voting Members',
    statInquiries: 'Inquiries & Volunteers',
    statYear: 'Founding Year',

    aboutEyebrow: 'Who We Are',
    aboutHeading: 'Rooted in community. Focused on possibility.',
    aboutP1: 'North Horizon Foundation Inc. is organized around an enduring belief: communities grow resilient and strong when individuals have access to educational opportunities, mutual support, and cultural roots.',
    aboutP2: 'With a special dedication to Nepalese and Nepalese-American individuals and families across New York and beyond, the foundation unites charitable assistance, mentorship, cultural arts, and leadership programs.',
    point1Title: 'People-First Support',
    point1Sub: 'Connecting families with essential assistance and referral networks.',
    point2Title: 'Respect for Culture & Heritage',
    point2Sub: 'Preserving identity, language, arts, and generational belonging.',
    point3Title: 'Shared Responsibility & Stewardship',
    point3Sub: 'Transparent non-profit governance adhering to 501(c)(3) standards.',

    programsEyebrow: 'What Guides Our Work',
    programsTitle: 'Four Paths. One Shared Purpose.',
    programsDesc: 'Our core focus areas create sustained pathways toward empowerment, health, and cultural vitality.',
    programGetInvolved: 'Explore & Participate',

    membershipEyebrow: 'Membership & Contributions',
    membershipTitle: 'Find Your Way to Contribute.',
    membershipDesc: 'Our draft bylaws establish voting member classes based on contribution tiers. Each tier supports foundation programs while empowering members with corresponding voting power.',
    votesLabel: 'votes in draft bylaws',
    inquireAboutTier: 'Ask about',
    tierDisclaimer: 'Contributions are charitable and do not represent ownership or equity. Tier eligibility and administration follow adopted Board policies and New York not-for-profit law.',
    calculatorTitle: 'Interactive Tier Estimator',
    calculatorDesc: 'Select your intended contribution level to view assigned voting rights and program support.',
    calculateVotes: 'Assigned Voting Power:',

    governanceEyebrow: 'Trust & Accountability',
    governanceTitle: 'Clear Principles. Responsible Stewardship.',
    governanceDesc: 'The foundation operates under a transparent governance framework designed to ensure mission alignment and fiduciary integrity.',
    bylawsDraftTitle: 'Organizational Bylaws Document',
    bylawsDraftDesc: 'Inspect the full draft bylaws, including Board of Director composition (7–9 members), annual meetings, and dissolution terms.',
    openBylawsBtn: 'Explore Interactive Bylaws',
    closeBylawsBtn: 'Close Viewer',

    newsEyebrow: 'News & Initiatives',
    newsTitle: 'Community Updates & Events',
    newsDesc: 'Stay informed on upcoming assemblies, educational cohorts, and welfare initiatives.',
    readMore: 'Read Full Detail',

    inquiryEyebrow: 'Take the Next Step',
    inquiryTitle: 'There is a Place for You in the Journey.',
    inquiryDesc: 'Whether you wish to volunteer, apply for membership, partner on a program, or ask a question, send us an inquiry and our team will follow up promptly.',
    formName: 'Full Name',
    formEmail: 'Email Address',
    formPhone: 'Phone Number (Optional)',
    formType: 'Inquiry Category',
    formTier: 'Interested Contribution Tier',
    formMessage: 'How can we help or collaborate?',
    formSubmit: 'Submit Inquiry Securely',
    formSubmitting: 'Registering Inquiry...',
    formPrivacy: 'Your information is securely stored in our foundation database for authorized personnel only.',

    aiTitle: 'Horizon Assistant',
    aiSubtitle: 'Ask questions about our bylaws, membership tiers, or programs',
    aiPromptPlaceholder: 'Ask about membership tiers, voting, governance...',
    aiSend: 'Ask',
    aiSuggested: 'Suggested Inquiries:',

    footerMotto: 'Together for a Brighter Future',
    footerRights: 'North Horizon Foundation Inc. All rights reserved.',
  },

  ne: {
    topbarSubtitle: 'समुदाय · संस्कृति · अवसर',
    locationLabel: 'क्विन्स काउन्टी, न्यूयोर्क',
    navAbout: 'हाम्रो बारेमा',
    navPrograms: 'मुख्य क्षेत्रहरू',
    navMembership: 'सदस्यता',
    navGovernance: 'सुशासन',
    navNews: 'सूचना तथा कार्यक्रम',
    navBylaws: 'विधान मस्यौदा',
    navGetInvolved: 'सहभागी हुनुहोस्',
    navAdmin: 'प्रशासन पोर्टल',
    globalSearchPlaceholder: 'कार्यक्रम, विधान, सदस्यता, समाचार खोज्नुहोस्...',

    heroEyebrow: 'एउटै क्षितिज, साझा भविष्य',
    heroHeadingLine1: 'हामी सँगै मिलेर',
    heroHeadingLine2: 'उज्ज्वल भविष्य निर्माण गर्छौं।',
    heroLead: 'शैक्षिक समृद्धि, सांस्कृतिक संरक्षण, सामुदायिक कल्याण र निस्वार्थ सेवामार्फत अवसरका नयाँ बाटाहरू खोल्दै।',
    heroBtnPrimary: 'हाम्रो यात्रामा जोडिनुहोस्',
    heroBtnSecondary: 'हाम्रो उद्देश्य जान्नुहोस्',
    heroPill: 'उद्देश्यमूलक। समुदाय-केन्द्रित। साझा उत्तरदायित्वमा आधारित।',
    heroSharedHorizon: 'एउटै साझा क्षितिज',
    heroSharedHorizonSub: 'सार्थक परिवर्तन ल्याउने धेरै बाटाहरू',
    heroStrongerTogether: 'एकतामा शक्ति',
    heroStrongerTogetherSub: 'मानवता र समुदाय हाम्रो केन्द्रबिन्दु',

    statPrograms: 'सक्रिय कार्यक्रमहरू',
    statMembers: 'मतदान अधिकारप्राप्त सदस्य',
    statInquiries: 'दर्ता भएका जिज्ञासा र स्वयंसेवक',
    statYear: 'स्थापना वर्ष',

    aboutEyebrow: 'हाम्रो परिचय',
    aboutHeading: 'समुदायमा जरा गाडेको, सम्भावनामा केन्द्रित।',
    aboutP1: 'नर्थ होराइजन फाउन्डेसन इन्क. एक दृढ विश्वासका साथ स्थापित संस्था हो: जब मानिसहरूले शिक्षा, आपसी सहयोग र सांस्कृतिक सम्बन्धमा पहुँच पाउँछन्, तब समुदाय बलियो र आत्मनिर्भर बन्छ।',
    aboutP2: 'विशेष गरी न्यूयोर्क तथा अन्य क्षेत्रमा बसोबास गर्ने नेपाली तथा नेपाली-अमेरिकन समुदायलाई केन्द्रमा राखी संस्थाले परोपकारी सहयोग, युवा मेन्टरसिप, कला-संस्कृति र नेतृत्व विकास कार्यक्रमहरू सञ्चालन गर्दछ।',
    point1Title: 'समुदाय-केन्द्रित प्रत्यक्ष सहयोग',
    point1Sub: 'आवश्यकतामा परेका परिवारहरूलाई स्रोत, साधन र परामर्श उपलब्ध गराउने।',
    point2Title: 'संस्कृति र सम्पदाको सम्मान',
    point2Sub: 'पहिचान, परम्परा, भाषा, कला र पुस्तान्तरण सम्बन्धको संरक्षण।',
    point3Title: 'पारदर्शी सुशासन र जवाफदेहिता',
    point3Sub: '५०१(सि)(३) मापदण्ड बमोजिम पारदर्शी र जिम्मेवार सञ्चालन।',

    programsEyebrow: 'हाम्रा मुख्य स्तम्भहरू',
    programsTitle: 'चार मार्ग, एउटै साझा लक्ष्य।',
    programsDesc: 'हाम्रा मुख्य कार्यक्रमहरू समुदायको सशक्तिकरण, स्वास्थ्य र सांस्कृतिक जीवन्ततामा समर्पित छन्।',
    programGetInvolved: 'विस्तृत हेर्नुहोस्',

    membershipEyebrow: 'सदस्यता तथा योगदान',
    membershipTitle: 'आफ्नो योगदानको स्तर छान्नुहोस्।',
    membershipDesc: 'हाम्रो मस्यौदा विधानले योगदान तहका आधारमा मतदान अधिकार प्रदान गर्दछ। प्रत्येक तहले संस्थागत कार्यक्रमहरूलाई टेवा पुर्याउँदै सदस्यहरूलाई निर्णायक भूमिका दिन्छ।',
    votesLabel: 'मतदान अधिकार (मस्यौदा विधान)',
    inquireAboutTier: 'सोधपुछ गर्नुहोस्:',
    tierDisclaimer: 'दान वा सदस्यता योगदान परोपकारी प्रयोजनका लागि हो, यो संस्थाको स्वामित्व वा शेयर होइन। सम्पूर्ण नियमहरू सञ्चालक समिति र न्यूयोर्क कानूनअनुसार हुनेछन्।',
    calculatorTitle: 'अन्तरक्रियात्मक सदस्यता क्याल्कुलेटर',
    calculatorDesc: 'आफ्नो सम्भावित योगदान रकम छानेर सम्बन्धित मताधिकार र सुविधाहरू हेर्नुहोस्।',
    calculateVotes: 'प्राप्त हुने मताधिकार:',

    governanceEyebrow: 'विश्वास तथा सुशासन',
    governanceTitle: 'स्पष्ट सिद्धान्त, जिम्मेवार नेतृत्व।',
    governanceDesc: 'फाउन्डेसनले जवाफदेही र पारदर्शी संरचनाअन्तर्गत काम गर्दछ ताकि हरेक स्रोत उद्देश्यअनुरूप सदुपयोग होस्।',
    bylawsDraftTitle: 'संस्थागत विधानको मस्यौदा',
    bylawsDraftDesc: 'सञ्चालक समिति (७-९ सदस्य), वार्षिक साधारणसभा र विघटनका प्रावधानसहितको पूर्ण विधान अध्ययन गर्नुहोस्।',
    openBylawsBtn: 'विधान मस्यौदा हेर्नुहोस्',
    closeBylawsBtn: 'बन्द गर्नुहोस्',

    newsEyebrow: 'ताजा सूचना र कार्यक्रम',
    newsTitle: 'सामुदायिक गतिविधि तथा अद्यावधिक',
    newsDesc: 'आगामी भेलाहरू, शैक्षिक तालिम र कल्याणकारी योजनाहरूबारे जानकारी पाउनुहोस्।',
    readMore: 'पूर्ण विवरण पढ्नुहोस्',

    inquiryEyebrow: 'आगामी कदम चाल्नुहोस्',
    inquiryTitle: 'यो यात्रामा तपाईंको पनि महत्वपूर्ण स्थान छ।',
    inquiryDesc: 'चाहे तपाईं स्वयंसेवक बन्न चाहनुहुन्छ, सदस्यता लिन चाहनुहुन्छ, साझेदारी गर्न चाहनुहुन्छ वा सामान्य प्रश्न सोध्न चाहनुहुन्छ, फारम भर्नुहोस्।',
    formName: 'पूरा नाम',
    formEmail: 'इमेल ठेगाना',
    formPhone: 'फोन नम्बर (ऐच्छिक)',
    formType: 'जिज्ञासाको प्रकार',
    formTier: 'इच्छुक सदस्यता तह',
    formMessage: 'हामी कसरी सहयोग वा सहकार्य गर्न सक्छौं?',
    formSubmit: 'सुरक्षित रूपमा पठाउनुहोस्',
    formSubmitting: 'दर्ता हुँदैछ...',
    formPrivacy: 'तपाईंको विवरण सुरक्षित राखिनेछ र आधिकारिक पदाधिकारीहरूले मात्र हेर्न सक्नेछन्।',

    aiTitle: 'होराइजन एआई सहायक',
    aiSubtitle: 'हाम्रो विधान, सदस्यता वा कार्यक्रमबारे तत्काल प्रश्न सोध्नुहोस्',
    aiPromptPlaceholder: 'सदस्यता तह, मतदान, विधान वा उद्देश्यबारे सोध्नुहोस्...',
    aiSend: 'सोध्नुहोस्',
    aiSuggested: 'सुझाइएका प्रश्नहरू:',

    footerMotto: 'उज्ज्वल भविष्यका लागि हातेमालो',
    footerRights: 'नर्थ होराइजन फाउन्डेसन इन्क. सर्वाधिकार सुरक्षित।',
  }
};
