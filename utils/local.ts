const defaultUser = 'guest-游客';

export function getUser() {
  if (typeof window !== 'undefined') {
    const queryParams = new URLSearchParams(window.location.search);
    const user = decodeURIComponent(queryParams.get('user') || '');
    return user || defaultUser;
  }
}

