export async function checkClientAuth() {
  try {
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Authentication failed');
    }

    return data.data;
  } catch (error) {
    console.error('Client auth check failed:', error);
    return { isAuthenticated: false, user: null };
  }
}
