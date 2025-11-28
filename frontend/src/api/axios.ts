import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling token refresh (placeholder for now)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Logic to handle 401 and refresh token will go here
    return Promise.reject(error);
  }
);

export default apiClient;
