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
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        config.headers['Pragma'] = 'no-cache';
        config.headers['Expires'] = '0';
    }
    return config;
});

export const apiMultipartActions: AxiosInstance = axios?.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

