import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 and we have a refresh token, try to refresh
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Try to refresh the access token
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/users/refresh-token`,
            { refreshToken },
            { withCredentials: true }
          );
          
          const { NewAccessToken } = response.data.data;
          localStorage.setItem('accessToken', NewAccessToken);
          
          // Retry the original request with the new token
          error.config.headers.Authorization = `Bearer ${NewAccessToken}`;
          return axios(error.config);
        } catch {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
