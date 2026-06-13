import axios, { type AxiosInstance } from 'axios';
import { ElMessage } from 'element-plus';
import { router } from '@/router';

const TOKEN_KEY = 'admin_token';

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body.code === 'number' && body.code !== 0) {
      ElMessage.error(body.message || '请求失败');
      return Promise.reject(body);
    }
    return body?.data ?? body;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      if (router.currentRoute.value.path !== '/login') {
        router.replace('/login');
      }
    }
    ElMessage.error(error.response?.data?.message || '网络异常');
    return Promise.reject(error);
  },
);

export default request;
