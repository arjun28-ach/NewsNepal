import axios from 'axios';
import { getCookie } from '../utils/cookies';

const configuredBaseURL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'https://newsbackend-4so0.onrender.com/api'
    : '/api'
);

const baseURL = configuredBaseURL === '/api' || configuredBaseURL.endsWith('/api')
  ? configuredBaseURL
  : `${configuredBaseURL.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 25000
});

// Add request interceptor for CSRF token
api.interceptors.request.use(config => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.method, request.url);
  return request;
});

// Update the response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      console.error('API Connection Error:', {
        message: error.message,
        code: error.code,
        config: error.config
      });
    } else {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers
      });
    }
    return Promise.reject(error);
  }
);

// API functions
export const fetchNews = async ({ page = 1, language = 'all', per_page = 20 }) => {
  try {
    const { data } = await api.get(`/news/?page=${page}&language=${language}&per_page=${per_page}`);
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const bookmarkArticle = async (article) => {
  try {
    const { data } = await api.post('/bookmarks/add/', article, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return data;
  } catch (error) {
    console.error('Error bookmarking article:', error);
    throw error;
  }
};

export const removeBookmark = async (articleUrl) => {
  try {
    const { data } = await api.post(`/bookmarks/remove/`, {
      article_url: articleUrl
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return data;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
};

export const getBookmarks = async () => {
  try {
    const { data } = await api.get('/bookmarks/');
    return data;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    throw error;
  }
};

export const getBookmarkCount = async () => {
  try {
    const { data } = await api.get('/bookmarks/count/');
    return data.count;
  } catch (error) {
    console.error('Error fetching bookmark count:', error);
    throw error;
  }
};

// Export the api instance as default
export default api;
