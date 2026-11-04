export class Expense {
  constructor({ description, amount, spentOn }) {
    this.description = description;
    this.amount = Number(amount);
    this.spentOn = spentOn;
  }

  totalOver(months) {
    return this.amount * months;
  }

  describe() {
    return `${this.description}: one-off ${this.amount}`;
  }
}

export class RecurringExpense extends Expense {
  constructor(details, everyMonths = 1) {
    super(details);
    this.everyMonths = everyMonths;
  }

  nextOccurrences(count) {
    const start = new Date(`${this.spentOn}T00:00:00`);
    return Array.from({ length: count }, (_, i) => {
      const next = new Date(start);
      next.setMonth(start.getMonth() + this.everyMonths * (i + 1));
      return next.toLocaleDateString('en-CA');
    });
  }

  totalOver(months) {
    return super.totalOver(Math.floor(months / this.everyMonths));
  }

  describe() {
    return `${this.description}: every ${this.everyMonths} month(s), ${this.amount} each`;
  }
}
