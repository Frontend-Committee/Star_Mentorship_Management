import axios from 'axios';

const attendanceApi = axios.create({
  baseURL: '/api-sessions',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default attendanceApi;
