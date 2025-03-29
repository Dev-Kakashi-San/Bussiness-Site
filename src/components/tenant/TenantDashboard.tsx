
import { useAuth } from '@/context/AuthContext';
import { getTenantPartitions, getTenantPayments } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, CreditCard, ReceiptText, User } from 'lucide-react';
import PartitionGrid from '../PartitionGrid';
import { useToast } from '@/hooks/use-toast';

const TenantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!user) return null;

  const partitions = getTenantPartitions(user.id);
  const payments = getTenantPayments(user.id);

  const handlePayRent = () => {
    toast({
      title: "Payment Initiated",
      description: "Your payment is being processed. You will receive a confirmation shortly.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Section */}
        <Card className="glass-morphism md:w-1/3">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.profileImage || ''} alt={user.name} />
              <AvatarFallback className="bg-partition-highlight text-xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">{user.name}</h3>
            <p className="text-gray-400 mt-1">{user.email}</p>
            <div className="mt-4 w-full">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400 flex items-center"><User className="h-4 w-4 mr-2" /> ID</span>
                <span>{user.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400 flex items-center"><Building className="h-4 w-4 mr-2" /> Partitions</span>
                <span>{partitions.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400 flex items-center"><ReceiptText className="h-4 w-4 mr-2" /> Payments</span>
                <span>{payments.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:w-2/3 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="glass-morphism">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Next Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-partition-highlight">
                      ${partitions[0]?.price || 0}
                    </p>
                    <p className="text-xs text-gray-400">
                      Due {partitions[0]?.tenant?.nextPayment ? new Date(partitions[0].tenant.nextPayment).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Button onClick={handlePayRent} className="purple-gradient">
                    <CreditCard className="h-4 w-4 mr-2" /> Pay Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div>
                    <p className="text-2xl font-bold">
                      <Badge className={
                        partitions[0]?.tenant?.paymentStatus === 'paid' 
                          ? 'bg-partition-available text-black' 
                          : partitions[0]?.tenant?.paymentStatus === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-partition-occupied'
                      }>
                        {partitions[0]?.tenant?.paymentStatus?.toUpperCase() || 'N/A'}
                      </Badge>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Last payment: {payments[0]?.date ? new Date(payments[0].date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="myPartitions" className="w-full">
            <TabsList className="w-full glass-morphism">
              <TabsTrigger value="myPartitions" className="flex-1">My Partitions</TabsTrigger>
              <TabsTrigger value="paymentHistory" className="flex-1">Payment History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="myPartitions" className="mt-4">
              {partitions.length > 0 ? (
                <PartitionGrid partitions={partitions} showStatus={false} />
              ) : (
                <Card className="glass-morphism py-8">
                  <CardContent className="text-center text-gray-400">
                    You don't have any partitions yet.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="paymentHistory" className="mt-4">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {payments.length > 0 ? (
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div 
                          key={payment.id} 
                          className="flex justify-between py-3 px-2 border-b border-white/10 last:border-0"
                        >
                          <div>
                            <p className="font-medium">
                              Payment #{payment.id}
                            </p>
                            <p className="text-sm text-gray-400">
                              {new Date(payment.date).toLocaleDateString()}
                            </p>
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
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      No payment history available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
