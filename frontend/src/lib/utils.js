import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from 'axios';
import api from '../hooks/api'

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}



export async function generateTempEmail() {
  try {
    const response = await axios.post(`${api}/api/email/generate`);

    return response.data.email;
  } catch (error) {
    console.error('Google login error:', error);
    toast.error(error.response?.data?.message || 'Login failed. Please try again.');
  }
}


export function generateQRCode(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}