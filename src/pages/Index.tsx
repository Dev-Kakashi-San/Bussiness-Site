
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { mockPartitions } from '@/lib/mockData';
import PartitionGrid from '@/components/PartitionGrid';
import Navbar from '@/components/Navbar';

const Index = () => {
  const navigate = useNavigate();
  const featuredPartitions = mockPartitions.filter(p => p.status === 'available').slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-12 flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-partition-highlight/20 -z-10" />
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in text-gradient">
          Find Your Perfect Business Space
        </h1>
        
        <p className="text-lg text-gray-300 max-w-3xl mb-8 animate-fade-in">
          Browse our collection of premium commercial partitions available for rent.
          Each space is carefully designed to help your business thrive.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          <Button 
            onClick={() => navigate('/partitions')}
            className="purple-gradient"
            size="lg"
          >
            View All Partitions <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            size="lg"
            className="border-partition-highlight text-partition-highlight hover:bg-partition-highlight/10"
          >
            Tenant Login
          </Button>
        </div>
      </section>

      {/* Featured Partitions */}
      <section className="py-16 px-6 md:px-12 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Partitions</h2>
            <Button 
              variant="link" 
              onClick={() => navigate('/partitions')}
              className="text-partition-highlight"
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <PartitionGrid partitions={featuredPartitions} />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 md:px-12 glass-morphism">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Our Spaces?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 glass-morphism rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-partition-highlight/20 text-partition-highlight">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Location</h3>
              <p className="text-gray-400">Strategically positioned partitions that maximize visibility and customer traffic.</p>
            </div>
            
            <div className="text-center p-6 glass-morphism rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-partition-highlight/20 text-partition-highlight">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Terms</h3>
              <p className="text-gray-400">Rental agreements tailored to your business needs with flexible payment options.</p>
            </div>
            
            <div className="text-center p-6 glass-morphism rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-partition-highlight/20 text-partition-highlight">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern Amenities</h3>
              <p className="text-gray-400">All partitions equipped with essential utilities and modern business amenities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2023 Partition Pavilion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
