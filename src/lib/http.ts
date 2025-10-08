// HTTP utility functions for Bajie API
export function createBasicAuthHeader(username: string, password: string): string {
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${auth}`;
}

export async function httpRequest<T = any>(url: string, options: RequestInit & { body?: any } = {}): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Если есть body и это не GET, преобразуем в JSON
    if (options.body && options.method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      data: data as T,
    };
  } catch (error) {
    console.error('HTTP Request Error:', error);
    return {
      ok: false,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
