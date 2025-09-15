import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://192.168.1.21:3000',
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    // Aqui você pode adicionar headers de autenticação
    // 'Authorization': 'Bearer ' + token,
  },
});

export default apiClient;
