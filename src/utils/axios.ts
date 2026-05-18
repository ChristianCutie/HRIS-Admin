// src/utils/axios.jsx
import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
    baseURL: "https://api-hris.slarenasitsolutions.com/public/api",
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
    },
    params: {
        '_t': () => Date.now() // This will add timestamp to all requests
    }
});

// Add a request interceptor to include timestamp in all requests
api.interceptors.request.use((config) => {
    // Add timestamp to prevent caching
    if (config.method === 'get') {
        config.params = {
            ...config.params,
            _t: Date.now()
        };
    }
    return config;
});

export default api;