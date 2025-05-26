import { api } from '@/api/adminApi';

// ...inside handleAddUserSubmit...


// Helper function for adding a user as admin
export const addUserAdmin = async (user: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) => {
  return api('/api/v1/admin/add_user_admin', {
    method: 'POST',
    body: user,
  });
};

const BASE_URL = 'http://127.0.0.1:8000';

export const getToken = () => localStorage.getItem('token') || '';

export const createProduct = async (formData: FormData) => {
  const token = getToken();
  const response = await api(`${BASE_URL}/api/v1/product/create`, {
    method: 'POST',
    headers: {
      Authorization: token,
      // Do NOT set Content-Type for FormData!
    },
    body: formData,
  });
  // If you want to return the raw response for header access:
  return response;
};

// api.ts
export const addSubcategory = async (categoryId: number, subForm: { name: string; slug: string }) => {
  const response = await fetch('/api/v1/cat/subcategory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...subForm, category_id: categoryId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return await response.json();
};
