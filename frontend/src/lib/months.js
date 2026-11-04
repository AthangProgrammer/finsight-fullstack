const toKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export function* lastMonths(count, from = new Date()) {
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    yield toKey(new Date(from.getFullYear(), from.getMonth() - offset, 1));
  }
}

export class MonthRange {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  [Symbol.iterator]() {
    let [year, month] = this.from.split('-').map(Number);
    const [endYear, endMonth] = this.to.split('-').map(Number);
    return {
      next: () => {
        if (year > endYear || (year === endYear && month > endMonth)) return { done: true, value: undefined };
        const value = `${year}-${String(month).padStart(2, '0')}`;
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
        return { done: false, value };
      },
    };
  }
}

export const monthLabel = (key) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short' });
