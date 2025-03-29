
import LoginForm from '@/components/auth/LoginForm';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Login = () => {
  const { user, loading } = useAuth();
  const { translate } = useLanguage();
  const isMobile = useIsMobile();

  // If already logged in, redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className={`w-full ${isMobile ? 'max-w-full' : 'max-w-md'}`}>
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-gradient">{translate('welcomeBack')}</h1>
          <LoginForm />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>{translate('serverHandledAuth')}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
