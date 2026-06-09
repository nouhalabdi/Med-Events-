import axios from 'axios'

// استبدل localhost برابط Render الخاص بك
const api = axios.create({
    baseURL: 'https://med-events-api.onrender.com',  // <- رابط الـ Backend على Render
    withCredentials: true
});

export default api;