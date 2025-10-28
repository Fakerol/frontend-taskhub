import axios from 'axios';

// Read base URL from .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: 'http://54.234.133.14:5000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('taskhub_access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('taskhub_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('taskhub_access_token', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        // Failed to refresh → redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Authentication APIs
export async function login(data) {
  const response = await api.post('/auth/login', data);
  const res = response.data;

  if (!res.success) throw new Error(res.message || 'Login failed');

  const { user, accessToken, refreshToken } = res.data;
  localStorage.setItem('taskhub_access_token', accessToken);
  localStorage.setItem('taskhub_refresh_token', refreshToken);
  localStorage.setItem('taskhub_user', JSON.stringify(user));

  return { user, accessToken, refreshToken };
}

export async function signup(data) {
  const response = await api.post('/auth/signup', data);
  const res = response.data;

  if (!res.success) throw new Error(res.message || 'Signup failed');

  const { user, accessToken, refreshToken } = res.data;
  localStorage.setItem('taskhub_access_token', accessToken);
  localStorage.setItem('taskhub_refresh_token', refreshToken);
  localStorage.setItem('taskhub_user', JSON.stringify(user));

  return { user, accessToken, refreshToken };
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem('taskhub_refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  const { accessToken } = response.data.data;
  localStorage.setItem('taskhub_access_token', accessToken);
  return { accessToken };
}

export async function logout() {
  localStorage.clear();
}

export { api };
