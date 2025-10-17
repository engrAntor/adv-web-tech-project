import axios from 'axios';

// --- THIS IS THE FIX ---
// We are hardcoding the backend URL directly.
// This removes any possibility of .env file errors.
const API_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL, // Use the hardcoded URL
  headers: { 'Content-Type': 'application/json' },
});

// The rest of the file is the same
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;