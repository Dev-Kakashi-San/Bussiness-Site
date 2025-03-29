
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockPartitions, mockPayments } from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  DollarSign, 
  Home, 
  Plus, 
  Search, 
  Users 
} from 'lucide-react';
import PartitionGrid from '../PartitionGrid';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!user) return null;

  const availablePartitions = mockPartitions.filter(p => p.status === 'available');
  const occupiedPartitions = mockPartitions.filter(p => p.status === 'occupied');
  const totalRevenue = mockPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleAddPartition = () => {
    toast({
      title: "Not Implemented",
      description: "This feature would allow adding new partitions.",
    });
  };

  const filteredPartitions = mockPartitions.filter(
    partition => 
      partition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partition.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Overview Statistics */}
        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="glass-morphism">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Total Partitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building className="h-8 w-8 text-partition-highlight" />
                <div>
                  <p className="text-2xl font-bold">{mockPartitions.length}</p>
                  <p className="text-xs text-gray-400">All partitions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Occupied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-partition-occupied" />
                <div>
                  <p className="text-2xl font-bold">{occupiedPartitions.length}</p>
                  <p className="text-xs text-gray-400">Active tenants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Home className="h-8 w-8 text-partition-available" />
                <div>
                  <p className="text-2xl font-bold">{availablePartitions.length}</p>
                  <p className="text-xs text-gray-400">Ready to rent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Card */}
        <Card className="glass-morphism md:w-1/3">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>All time revenue from completed payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6">
              <DollarSign className="h-10 w-10 text-partition-highlight mr-2" />
              <span className="text-4xl font-bold">{totalRevenue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Partition Button and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Button onClick={handleAddPartition} className="purple-gradient w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add New Partition
        </Button>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search partitions..."
            className="pl-8 bg-secondary/50"
          />
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="allPartitions" className="w-full">
        <TabsList className="w-full glass-morphism">
          <TabsTrigger value="allPartitions" className="flex-1">All Partitions</TabsTrigger>
          <TabsTrigger value="occupied" className="flex-1">Occupied</TabsTrigger>
          <TabsTrigger value="available" className="flex-1">Available</TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="allPartitions" className="mt-4">
          <PartitionGrid partitions={filteredPartitions} />
        </TabsContent>
        
        <TabsContent value="occupied" className="mt-4">
          <PartitionGrid partitions={occupiedPartitions.filter(
            p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 p.location.toLowerCase().includes(searchQuery.toLowerCase())
          )} />
        </TabsContent>
        
        <TabsContent value="available" className="mt-4">
          <PartitionGrid partitions={availablePartitions.filter(
            p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 p.location.toLowerCase().includes(searchQuery.toLowerCase())
          )} />
        </TabsContent>
        
        <TabsContent value="payments" className="mt-4">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockPayments.map((payment) => {
                  const partition = mockPartitions.find(p => p.id === payment.partitionId);
                  return (
                    <div 
                      key={payment.id} 
                      className="flex justify-between py-3 px-2 border-b border-white/10 last:border-0"
                    >
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="bg-partition-highlight">
                            {partition?.tenant?.name.charAt(0) || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {partition?.tenant?.name || 'Unknown Tenant'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {partition?.name} - {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-partition-highlight">
                          ${payment.amount}
                        </p>
                        <Badge className={
                          payment.status === 'completed' 
                            ? 'bg-partition-available text-black' 
                            : payment.status === 'pending'
                              ? 'bg-yellow-500'
                              : 'bg-partition-occupied'
                        }>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
