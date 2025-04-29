// src/services/authService.ts
import axios from 'axios';
import { API_URL } from '../config';

class AuthService {
  async register(userData: { username: string; email: string; password: string }) {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  }

  async login(userData: { emailOrUsername: string; password: string }) {
    const response = await axios.post(`${API_URL}/auth/login`, userData);
    return response.data;
  }

  async getProfile() {
    const response = await axios.get(`${API_URL}/auth/profile`);
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
    return response.data;
  }
}

export default new AuthService();
