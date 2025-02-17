import axios from "axios";
import { toast } from "react-toastify";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: "https://parking-spot-one.vercel.app/api/v1/",
  // baseURL: "http://localhost:3000/api/v1/",
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.log("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.message === "Network Error") {
      // Show network error toast
      toast.error("Network error! Please check your internet connection.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
