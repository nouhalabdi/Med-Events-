import axios from 'axios'

// استبدل localhost برابط Render الخاص بك
const api = axios.create({
    baseURL: 'https://med-events.onrender.com',  // <- رابط الـ Backend على Render
    withCredentials: true
});

export default api;