const USERNAME = /^[a-zA-Z0-9_]{3,30}$/;
const AMOUNT = /^\d{1,8}(\.\d{1,2})?$/;

export const validateUsername = (value) =>
  USERNAME.test(value) ? '' : 'Username must be 3-30 letters, digits or underscores.';

export const validatePassword = (value) => {
  if (value.length < 10 || value.length > 72) return 'Password must be 10 to 72 characters.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Password needs at least one letter and one digit.';
  return '';
};

export const validateAmount = (value) => {
  if (!AMOUNT.test(String(value))) return 'Enter an amount with at most 2 decimals.';
  const number = Number(value);
  return number >= 0.01 && number <= 10000000 ? '' : 'Amount must be between 0.01 and 1,00,00,000.';
};
