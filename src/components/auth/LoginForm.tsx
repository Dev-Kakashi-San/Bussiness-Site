
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { translate } = useLanguage();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: translate('pleaseEnterCredentials'),
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/dashboard');
      toast({
        title: translate('loginSuccess'),
        description: translate('welcomeToYourAccount'),
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: translate('loginFailed'),
        description: translate('invalidCredentials'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`${isMobile ? 'w-full' : 'max-w-md w-full mx-auto'} glass-morphism`}>
      <CardHeader>
        <div className="flex items-center justify-center mb-2">
          <Smartphone className="h-6 w-6 mr-2 text-partition-highlight" />
          <CardTitle className="text-xl md:text-2xl text-center">{translate('login')}</CardTitle>
        </div>
        <CardDescription className="text-center">
          {translate('enterCredentials')}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {translate('email')}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com or tenant@example.com"
              className="bg-secondary/50"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {translate('password')}
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="bg-secondary/50"
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full purple-gradient"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {translate('loggingIn')}
              </span>
            ) : (
              <span className="flex items-center">
                <LogIn className="mr-2 h-5 w-5" /> {translate('login')}
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
