import axios from 'axios';

const BASE_URL = 'https://jsonplaceholder.typicode.com'; // Dummy URL until backend is ready

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock interceptors for auth if needed
axiosClient.interceptors.request.use(
  async config => {
    // Add auth token here when real auth is implemented
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.reject(error);
  },
);
