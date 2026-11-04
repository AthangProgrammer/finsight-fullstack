const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const money = (value) => rupees.format(Number(value || 0));

export const percent = (part, whole) => (whole ? Math.min(100, (part / whole) * 100) : 0);

export const formatDate = (value) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today';

export const today = () => new Date().toLocaleDateString('en-CA');
