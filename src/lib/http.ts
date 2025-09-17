export function createBasicAuthHeader(username: string, password: string): string {
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${auth}`;
}

export async function httpRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return response;
}
