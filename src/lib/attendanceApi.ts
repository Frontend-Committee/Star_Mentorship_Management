import axios from 'axios';

const attendanceApi = axios.create({
  baseURL: 'https://attendanceapp.pythonanywhere.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default attendanceApi;
