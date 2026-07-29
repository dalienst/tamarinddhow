import axios, { AxiosInstance } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default axios?.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

export const apiActions: AxiosInstance = axios?.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

apiActions.interceptors.request.use((config) => {
    if (config.method === 'get') {
        config.params = {
            ...config.params,
            _t: Date.now(),
        };
    }
    return config;
});

export const apiMultipartActions: AxiosInstance = axios?.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

