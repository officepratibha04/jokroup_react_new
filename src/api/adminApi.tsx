// Centralized API helper for the project

const BASE_URL = 'http://127.0.0.1:8000';

export const getToken = () => localStorage.getItem('token') || '';

export const api = async (
  endpoint: string,
  {
    method = 'GET',
    headers = {},
    body = null,
    auth = true,
    ...customConfig
  }: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    auth?: boolean;
    [key: string]: any;
  } = {}
) => {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...customConfig,
  };

  if (auth) {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: token,
      };
    }
  }

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw data || { detail: 'API Error' };
  }

  return data;
};