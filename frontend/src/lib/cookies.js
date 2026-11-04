export const getCookie = (name) => {
  const pair = document.cookie.split('; ').find((entry) => entry.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : '';
};

export const setCookie = (name, value, days = 365) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${days * 86400}; path=/; samesite=lax`;
};
