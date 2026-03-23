import axios from "axios";

export const BASE_URL="https://handloom-marketplace.onrender.com";


<img src={`${BASE}${i.image_url}`} />

const API = axios.create({
  baseURL: BASE_URL + "/api",
  withCredentials:false
});


// 🔍 Network Traffic Logging
API.interceptors.request.use(request => {
  console.log('--- Network Request ---', request.method.toUpperCase(), request.url, request.data);
  return request;
});

API.interceptors.response.use(
  response => {
    console.log('--- Network Response ---', response.status, response.data);
    return response;
  },
  error => {
    if (!error.response) {
      // Network error (server down, CORS, etc.)
      console.error('--- Network Error (No Response) ---', error.message);
      error.message = "Server is unreachable. Please ensure the backend is running.";
    } else {
      console.error('--- Network Error ---', error.response?.status, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
