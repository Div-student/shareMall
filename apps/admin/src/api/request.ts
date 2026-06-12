import axios, { type AxiosInstance } from 'axios';
import { ElMessage } from 'element-plus';

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
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
    ElMessage.error(error.response?.data?.message || '网络异常');
    return Promise.reject(error);
  },
);

export default request;
