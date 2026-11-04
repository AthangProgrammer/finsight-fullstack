import { getCookie, setCookie } from './cookies.js';

const LIGHT = { '--bg': '#eef3fb', '--panel': '#ffffff', '--line': '#d3ddee', '--text': '#0d1a31', '--muted': '#51627d' };

export const applyTheme = (name) => {
  const root = document.documentElement;
  Object.entries(LIGHT).forEach(([key, value]) =>
    name === 'light' ? root.style.setProperty(key, value) : root.style.removeProperty(key),
  );
};

export const toggleTheme = () => {
  const next = getCookie('theme') === 'light' ? 'dark' : 'light';
  setCookie('theme', next);
  applyTheme(next);
};
