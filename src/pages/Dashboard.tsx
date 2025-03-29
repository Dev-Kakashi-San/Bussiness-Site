
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/admin/AdminDashboard';
import TenantDashboard from '@/components/tenant/TenantDashboard';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const Dashboard = () => {
  const { user, loading, isAdmin, isTenant } = useAuth();
  const navigate = useNavigate();
  const { translate } = useLanguage();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-subtle text-center">
          <svg className="animate-spin h-12 w-12 text-partition-highlight mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">{translate('loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8 text-gradient">
          {isAdmin ? translate('adminDashboard') : translate('tenantDashboard')}
        </h1>
        
        {isAdmin && <AdminDashboard />}
        {isTenant && <TenantDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
