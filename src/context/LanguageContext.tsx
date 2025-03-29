
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define all the translations
const translations = {
  en: {
    // General
    home: 'Home',
    partitions: 'Partitions',
    dashboard: 'Dashboard',
    login: 'Login',
    logout: 'Logout',
    switchLanguage: 'Switch Language',
    
    // Index page
    findYourPerfectSpace: 'Find Your Perfect Business Space',
    browseCollection: 'Browse our collection of premium commercial partitions available for rent. Each space is carefully designed to help your business thrive.',
    viewAllPartitions: 'View All Partitions',
    tenantLogin: 'Tenant Login',
    featuredPartitions: 'Featured Partitions',
    viewAll: 'View All',
    
    // Why choose us section
    whyChooseOurSpaces: 'Why Choose Our Spaces?',
    primeLocation: 'Prime Location',
    primeLocationDesc: 'Strategically positioned partitions that maximize visibility and customer traffic.',
    flexibleTerms: 'Flexible Terms',
    flexibleTermsDesc: 'Rental agreements tailored to your business needs with flexible payment options.',
    modernAmenities: 'Modern Amenities',
    modernAmenitiesDesc: 'All partitions equipped with essential utilities and modern business amenities.',
    
    // Footer
    copyright: '© 2023 Rama Kuti Rentings. All rights reserved.',
    
    // Login page
    welcomeBack: 'Welcome Back',
    email: 'Email',
    password: 'Password',
    loggingIn: 'Logging In...',
    pleaseEnterCredentials: 'Please enter your email and password',
    loginSuccess: 'Login Successful',
    welcomeToYourAccount: 'Welcome to your account',
    loginFailed: 'Login Failed',
    invalidCredentials: 'Invalid email or password',
    enterCredentials: 'Enter your credentials to login',
    serverHandledAuth: 'Authentication is handled securely on our servers',
    
    // Dashboard
    adminDashboard: 'Admin Dashboard',
    tenantDashboard: 'Tenant Dashboard',
    loadingDashboard: 'Loading dashboard...',
  },
  hi: {
    // General
    home: 'होम',
    partitions: 'पार्टीशन',
    dashboard: 'डैशबोर्ड',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    switchLanguage: 'भाषा बदलें',
    
    // Index page
    findYourPerfectSpace: 'अपना आदर्श व्यापार स्थान खोजें',
    browseCollection: 'किराए के लिए उपलब्ध प्रीमियम वाणिज्यिक पार्टीशन के हमारे संग्रह को ब्राउज़ करें। प्रत्येक स्थान आपके व्यवसाय को फलने-फूलने में मदद करने के लिए सावधानी से डिज़ाइन किया गया है।',
    viewAllPartitions: 'सभी पार्टीशन देखें',
    tenantLogin: 'किरायेदार लॉगिन',
    featuredPartitions: 'विशेष पार्टीशन',
    viewAll: 'सभी देखें',
    
    // Why choose us section
    whyChooseOurSpaces: 'हमारे स्थानों को क्यों चुनें?',
    primeLocation: 'प्रमुख स्थान',
    primeLocationDesc: 'रणनीतिक रूप से स्थित पार्टीशन जो दृश्यता और ग्राहक यातायात को अधिकतम करते हैं।',
    flexibleTerms: 'लचीले नियम',
    flexibleTermsDesc: 'आपकी व्यावसायिक जरूरतों के अनुरूप किराया समझौते लचीले भुगतान विकल्पों के साथ।',
    modernAmenities: 'आधुनिक सुविधाएँ',
    modernAmenitiesDesc: 'सभी पार्टीशन आवश्यक उपयोगिताओं और आधुनिक व्यावसायिक सुविधाओं से सुसज्जित हैं।',
    
    // Footer
    copyright: '© 2023 रामा कुटी रेंटिंग्स। सर्वाधिकार सुरक्षित।',
    
    // Login page
    welcomeBack: 'वापसी पर स्वागत है',
    email: 'ईमेल',
    password: 'पासवर्ड',
    loggingIn: 'लॉग इन हो रहा है...',
    pleaseEnterCredentials: 'कृपया अपना ईमेल और पासवर्ड दर्ज करें',
    loginSuccess: 'लॉगिन सफल',
    welcomeToYourAccount: 'आपके खाते में आपका स्वागत है',
    loginFailed: 'लॉगिन विफल',
    invalidCredentials: 'अमान्य ईमेल या पासवर्ड',
    enterCredentials: 'लॉगिन करने के लिए अपना विवरण दर्ज करें',
    serverHandledAuth: 'प्रमाणीकरण हमारे सर्वर पर सुरक्षित रूप से संभाला जाता है',
    
    // Dashboard
    adminDashboard: 'व्यवस्थापक डैशबोर्ड',
    tenantDashboard: 'किरायेदार डैशबोर्ड',
    loadingDashboard: 'डैशबोर्ड लोड हो रहा है...',
  }
};

type Language = 'en' | 'hi';
type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Check if user has a saved language preference
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'en';
  });

  useEffect(() => {
    // Store language preference
    localStorage.setItem('language', language);
    // Set html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const translate = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
