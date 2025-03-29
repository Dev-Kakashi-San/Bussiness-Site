
import LoginForm from '@/components/auth/LoginForm';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { user, loading } = useAuth();

  // If already logged in, redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-gradient">Welcome Back</h1>
          <LoginForm />
        </div>
      </main>
    </div>
  );
};

export default Login;
