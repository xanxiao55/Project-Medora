import { QueryClient } from '@tanstack/react-query';

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }
  return res;
}

export async function apiRequest(method, url, data, options = {}) {
  const { on401 = "throw" } = options;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const res = await fetch(url, config);
  
  if (res.status === 401) {
    if (on401 === "returnNull") {
      return null;
    }
    throw new Error('Unauthorized');
  }

  await throwIfResNotOk(res);
  return res.json();
}

export const getQueryFn = (options = {}) => {
  const { on401 = "throw" } = options;
  
  return async ({ queryKey }) => {
    const url = typeof queryKey[0] === 'string' ? queryKey[0] : queryKey.join('/');
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = await fetch(url, config);
    
    if (res.status === 401) {
      if (on401 === "returnNull") {
        return null;
      }
      throw new Error('Unauthorized');
    }

    await throwIfResNotOk(res);
    return res.json();
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});