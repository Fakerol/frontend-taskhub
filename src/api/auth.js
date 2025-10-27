
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include access token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('taskhub_access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('taskhub_refresh_token');
        if (refreshToken) {
          const response = await axios.post('http://localhost:5000/api/auth/refresh', {
            refreshToken: refreshToken
          });
          
          const { accessToken } = response.data.data;
          localStorage.setItem('taskhub_access_token', accessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('taskhub_access_token');
        localStorage.removeItem('taskhub_refresh_token');
        localStorage.removeItem('taskhub_user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API functions
export async function login(data) {
  try {
    console.log('Attempting login with data:', data);
    const response = await api.post('/auth/login', data);
    console.log('Login response:', response.data);
    
    // Check if the response indicates success
    if (response.data.success === false) {
      // Handle validation errors
      if (Array.isArray(response.data.message)) {
        // Multiple validation errors
        const errorMessages = response.data.message.map(err => err.message).join(', ');
        throw new Error(errorMessages);
      } else {
        // Single error message
        throw new Error(response.data.message);
      }
    }
    
    // Check if response has the expected structure for success
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response structure from server');
    }
    
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Validate that we have the required data
    if (!user || !accessToken || !refreshToken) {
      throw new Error('Missing required data in response');
    }
    
    // Store tokens and user data
    localStorage.setItem('taskhub_access_token', accessToken);
    localStorage.setItem('taskhub_refresh_token', refreshToken);
    localStorage.setItem('taskhub_user', JSON.stringify(user));
    
    return { user, accessToken, refreshToken };
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error response:', error.response?.data);
    
    // Handle axios errors (network, 4xx, 5xx)
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle validation errors from axios error response
      if (Array.isArray(errorData)) {
        const errorMessages = errorData.map(err => err.message).join(', ');
        throw new Error(errorMessages);
      } else if (errorData.message) {
        throw new Error(errorData.message);
      }
    }
    
    // Handle other errors
    if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Login failed - please check your credentials');
    }
  }
}

export async function signup(data) {
  try {
    const response = await api.post('/auth/signup', data);
    const res = response.data;

    if (!res.success) {
      // Backend handles all message formatting
      throw new Error(res.message || 'Signup failed');
    }

    const { user, accessToken, refreshToken } = res.data;

    // Store tokens and user data
    localStorage.setItem('taskhub_access_token', accessToken);
    localStorage.setItem('taskhub_refresh_token', refreshToken);
    localStorage.setItem('taskhub_user', JSON.stringify(user));

    return { user, accessToken, refreshToken };
  } catch (error) {
    // Let backend's message surface directly
    const backendMessage = error.response?.data?.message;

    throw new Error(backendMessage || 'Signup failed - please try again');
  }
}


export async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('taskhub_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post('http://localhost:5000/api/auth/refresh', {
      refreshToken: refreshToken
    });
    
    const { accessToken } = response.data.data;
    localStorage.setItem('taskhub_access_token', accessToken);
    
    return { accessToken };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Token refresh failed');
  }
}

export async function logout() {
  try {
    // Clear local storage
    localStorage.removeItem('taskhub_access_token');
    localStorage.removeItem('taskhub_refresh_token');
    localStorage.removeItem('taskhub_user');
    
    // Optionally call logout endpoint if available
    // await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Export the configured axios instance for other API calls
export { api };