// AWS API Gateway configuration
export const API_CONFIG = {
  BASE_URL: 'https://your-api-gateway-id.execute-api.region.amazonaws.com/prod',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      VERIFY: '/auth/verify',
      REGISTER: '/auth/register'
    },
    PROPERTIES: {
      LIST: '/properties',
      CREATE: '/properties',
      UPDATE: '/properties',
      DELETE: '/properties',
      SEARCH: '/properties/search'
    },
    RENTALS: {
      LIST: '/rentals',
      CREATE: '/rentals',
      UPDATE: '/rentals',
      PAYMENTS: '/rentals/payments'
    },
    ADMIN: {
      USERS: '/admin/users',
      PROPERTIES: '/admin/properties',
      RENTALS: '/admin/rentals',
      STATS: '/admin/stats'
    },
    UPLOAD: '/upload'
  }
};

// Helper function to make API calls with authentication
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
};