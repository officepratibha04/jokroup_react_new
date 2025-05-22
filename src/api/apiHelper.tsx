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