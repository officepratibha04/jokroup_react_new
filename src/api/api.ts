import axios from 'axios';
import { Product, User, Category, Coupon } from '../types';

export const BASE_URL = 'http://localhost:8000/api'; // FastAPI base URL
//export const API_URL = 'http://localhost:8000'; // FastAPI base URL for other requests

export const products = async (): Promise<Product[]> => {
  const res = await axios.get<Product[]>(`${BASE_URL}/v1/product/list`);
  return res.data;
};

export const categories = async (): Promise<Category[]> => {
  const res = await axios.get<Category[]>(`${BASE_URL}/categories`);
  return res.data;
};
// api.ts
export const getCategories = async (): Promise<Category[]> => {
  const res = await axios.get<Category[]>(`${BASE_URL}/v1/cat/category`);
  return res.data;
};

export const users = async (): Promise<User[]> => {
  const res = await axios.get<User[]>(`${BASE_URL}/v1/users/signUp`);
  return res.data;
};

export const coupons = async (): Promise<Coupon[]> => {
  const res = await axios.get<Coupon[]>(`${BASE_URL}/coupons`);
  return res.data;
};
