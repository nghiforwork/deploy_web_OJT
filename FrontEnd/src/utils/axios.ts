import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// Nếu có đăng nhập JWT, thêm request interceptor
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("accessToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// Thêm response interceptor để xử lý lỗi chung
// api.interceptors.response.use(
//   (res) => res,
//   (error) => {
//     if (error.response?.status === 401) {
//       // token hết hạn -> logout hoặc redirect login
//     }
//     return Promise.reject(error);
//   },
// );

export default api;
