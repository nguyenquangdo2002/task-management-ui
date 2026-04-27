import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5284/api',
});
// const axiosClient = axios.create({
//     baseURL: 'https://learningnettaskmanagement-production.up.railway.app/api',
// });


axiosClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default axiosClient;