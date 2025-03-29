
// Mock data for partitions
export type Partition = {
  id: string;
  name: string;
  size: {
    width: number;
    length: number;
    area: number;
    unit: string;
  };
  location: string;
  description: string;
  imageUrl: string;
  status: 'available' | 'occupied';
  price: number;
  tenant?: {
    id: string;
    name: string;
    since: string; // ISO date string
    nextPayment: string; // ISO date string
    paymentStatus: 'paid' | 'pending' | 'overdue';
  };
};

export type Payment = {
  id: string;
  partitionId: string;
  tenantId: string;
  amount: number;
  date: string; // ISO date string
  status: 'completed' | 'pending' | 'failed';
  method: 'card' | 'bank' | 'cash';
};

export const mockPartitions: Partition[] = [
  {
    id: '1',
    name: 'Corner Store Lot',
    size: {
      width: 10,
      length: 20,
      area: 200,
      unit: 'sqm',
    },
    location: 'Northeast Corner',
    description: 'Prime corner location with high visibility and foot traffic',
    imageUrl: '/placeholder.svg',
    status: 'occupied',
    price: 1200,
    tenant: {
      id: '2',
      name: 'Tenant User',
      since: '2023-06-15',
      nextPayment: '2023-12-15',
      paymentStatus: 'paid',
    },
  },
  {
    id: '2',
    name: 'Central Kiosk Space',
    size: {
      width: 5,
      length: 5,
      area: 25,
      unit: 'sqm',
    },
    location: 'Central Plaza',
    description: 'Small kiosk space in the central plaza with high foot traffic',
    imageUrl: '/placeholder.svg',
    status: 'available',
    price: 800,
  },
  {
    id: '3',
    name: 'Large Retail Space',
    size: {
      width: 15,
      length: 25,
      area: 375,
      unit: 'sqm',
    },
    location: 'Main Entrance',
    description: 'Large retail space near main entrance with display windows',
    imageUrl: '/placeholder.svg',
    status: 'available',
    price: 2500,
  },
  {
    id: '4',
    name: 'Office Space A',
    size: {
      width: 8,
      length: 12,
      area: 96,
      unit: 'sqm',
    },
    location: 'Second Floor',
    description: 'Office space with windows and separate entrance',
    imageUrl: '/placeholder.svg',
    status: 'occupied',
    price: 1500,
    tenant: {
      id: '3',
      name: 'Office Corp',
      since: '2023-03-10',
      nextPayment: '2023-12-10',
      paymentStatus: 'pending',
    },
  },
  {
    id: '5',
    name: 'Storage Unit',
    size: {
      width: 6,
      length: 8,
      area: 48,
      unit: 'sqm',
    },
    location: 'Basement Level',
    description: 'Climate controlled storage space with 24/7 access',
    imageUrl: '/placeholder.svg',
    status: 'available',
    price: 600,
  },
  {
    id: '6',
    name: 'Food Court Stall',
    size: {
      width: 4,
      length: 6,
      area: 24,
      unit: 'sqm',
    },
    location: 'Food Court',
    description: 'Ready-to-use food stall with electrical and water hookups',
    imageUrl: '/placeholder.svg',
    status: 'occupied',
    price: 1000,
    tenant: {
      id: '4',
      name: 'Tasty Treats',
      since: '2023-01-05',
      nextPayment: '2023-12-05',
      paymentStatus: 'overdue',
    },
  },
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    partitionId: '1',
    tenantId: '2',
    amount: 1200,
    date: '2023-11-15',
    status: 'completed',
    method: 'card',
  },
  {
    id: '2',
    partitionId: '1',
    tenantId: '2',
    amount: 1200,
    date: '2023-10-15',
    status: 'completed',
    method: 'bank',
  },
  {
    id: '3',
    partitionId: '4',
    tenantId: '3',
    amount: 1500,
    date: '2023-11-10',
    status: 'completed',
    method: 'bank',
  },
  {
    id: '4',
    partitionId: '6',
    tenantId: '4',
    amount: 1000,
    date: '2023-11-05',
    status: 'failed',
    method: 'card',
  },
  {
    id: '5',
    partitionId: '6',
    tenantId: '4',
    amount: 1000,
    date: '2023-10-05',
    status: 'completed',
    method: 'cash',
  },
];

export const getTenantPartitions = (tenantId: string): Partition[] => {
  return mockPartitions.filter(
    partition => partition.tenant?.id === tenantId
  );
};

export const getTenantPayments = (tenantId: string): Payment[] => {
  return mockPayments.filter(
    payment => payment.tenantId === tenantId
  );
};
