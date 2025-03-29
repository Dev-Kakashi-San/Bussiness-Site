
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Globe, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, translate } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-partition-highlight">Rama Kuti Rentings</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
              {translate('home')}
            </Link>
            <Link to="/partitions" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
              {translate('partitions')}
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                >
                  {translate('dashboard')}
                </Link>
                <div className="flex items-center ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleLogout} 
                    className="ml-2"
                  >
                    <LogOut className="h-5 w-5 text-gray-300" />
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="border-partition-highlight text-partition-highlight hover:bg-partition-highlight/10"
              >
                {translate('login')}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="ml-2"
              title={translate('switchLanguage')}
            >
              <Globe className="h-5 w-5 text-gray-300" />
              <span className="ml-1 text-xs font-semibold">{language.toUpperCase()}</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="mr-2"
              title={translate('switchLanguage')}
            >
              <Globe className="h-5 w-5 text-gray-300" />
              <span className="ml-1 text-xs font-semibold">{language.toUpperCase()}</span>
            </Button>
            
            <button
              type="button"
              className="text-gray-300 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-morphism animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {translate('home')}
            </Link>
            <Link
              to="/partitions"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {translate('partitions')}
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate('dashboard')}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md w-full text-left"
                >
                  {translate('logout')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-partition-highlight hover:text-white block px-3 py-2 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {translate('login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
