import axios, { type AxiosInstance } from 'axios';
import { showToast } from 'vant';

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body.code === 'number' && body.code !== 0) {
      showToast(body.message || '请求失败');
      return Promise.reject(body);
    }
    return body?.data ?? body;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    showToast(error.response?.data?.message || '网络异常');
    return Promise.reject(error);
  },
);

export default request;
