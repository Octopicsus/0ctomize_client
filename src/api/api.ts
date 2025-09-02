const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001'
const API_BASE_URL = `${API_URL.replace(/\/+$/, '')}/api`;

export const API_ENDPOINTS = {
  CATEGORIES: '/data/categories.json',
  ICONS: '/data/iconsCategories.json',
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  TRANSACTIONS: `${API_BASE_URL}/transactions`,
  CUSTOM_CATEGORIES: `${API_BASE_URL}/categories`,
};

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    createdAt?: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const result = await response.json();
    return result;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  verify: async (token: string) => {
    const response = await fetch(API_ENDPOINTS.AUTH.VERIFY, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const result = await response.json();
    return result;
  },

  logout: async (refreshToken: string) => {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    const result = await response.json();
    return result;
  },
}; 

export interface Transaction {
  _id?: string;
  id?: number;
  userId?: string;
  userEmail?: string;
  type: string;
  title: string;
  description: string;
  notes?: string;
  bankAccountId?: string;
  amount: number;
  originalAmount: number;
  originalCurrency: string;
  date: string;
  time: string;
  img: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  categoryConfidence?: number;
  categorySource?: 'auto' | 'manual' | 'rule' | 'llm' | 'override';
  categoryReason?: string;
}

export const transactionsAPI = {
  getTransactions: async (token: string) => {
    const response = await fetch(API_ENDPOINTS.TRANSACTIONS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return response.json();
  },

  createTransaction: async (token: string, transaction: Omit<Transaction, '_id' | 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(API_ENDPOINTS.TRANSACTIONS, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create transaction');
    }

    return response.json();
  },

  updateTransaction: async (token: string, transactionId: string, updateData: Partial<Transaction>) => {
    const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update transaction');
    }

    return response.json();
  },

  deleteTransaction: async (token: string, transactionId: string) => {
    const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete transaction');
    }

    return response.json();
  },
};

export interface CustomCategory {
  _id?: string;
  name: string;
  iconPath: string;
  userId?: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const categoriesAPI = {
  getUserCategories: async (token: string): Promise<{ categories: CustomCategory[] }> => {
    const response = await fetch(API_ENDPOINTS.CUSTOM_CATEGORIES, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch categories');
    }

    return response.json();
  },

  createCategory: async (token: string, categoryData: { name: string; iconPath: string }): Promise<{ message: string; category: CustomCategory }> => {
    const response = await fetch(API_ENDPOINTS.CUSTOM_CATEGORIES, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    return response.json();
  },

  updateCategory: async (token: string, categoryId: string, updateData: { name?: string; iconPath?: string }): Promise<{ message: string }> => {
    const response = await fetch(`${API_ENDPOINTS.CUSTOM_CATEGORIES}/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category');
    }

    return response.json();
  },

  deleteCategory: async (token: string, categoryId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_ENDPOINTS.CUSTOM_CATEGORIES}/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete category');
    }

    return response.json();
  },
};