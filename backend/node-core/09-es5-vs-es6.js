console.log('===== ES5 =====');

function ExpenseES5(description, amount, category) {
  this.description = description;
  this.amount = amount;
  this.category = category || 'Other';
}

ExpenseES5.prototype.label = function () {
  return this.description + ' (' + this.category + '): Rs ' + this.amount;
};

function totalByCategoryES5(expenses) {
  var totals = {};
  for (var i = 0; i < expenses.length; i++) {
    var e = expenses[i];
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  }
  return totals;
}

function loadExpensesES5(callback) {
  setTimeout(function () {
    callback(null, [new ExpenseES5('Chai', 20, 'Food'), new ExpenseES5('Metro', 500, 'Transport'), new ExpenseES5('Lunch', 150, 'Food')]);
  }, 10);
}

console.log('var hoisting:', typeof hoisted, hoisted);
var hoisted = 'now defined';

var fnsES5 = [];
for (var i = 0; i < 3; i++) {
  fnsES5.push(function () {
    return i;
  });
}
console.log('var in loop closure:', fnsES5.map(function (f) { return f(); }));

var counterES5 = {
  count: 0,
  startBroken: function () {
    setTimeout(function () {
      console.log('regular function this.count:', this === counterES5 ? this.count : 'this is not counterES5');
    }, 0);
  },
  startFixedWithThat: function () {
    var that = this;
    setTimeout(function () {
      console.log('var that = this:', that.count);
    }, 0);
  },
};
counterES5.startBroken();
counterES5.startFixedWithThat();

loadExpensesES5(function (err, list) {
  if (err) return console.log(err);
  console.log(list[0].label());
  console.log(totalByCategoryES5(list));
  runES6();
});

function runES6() {
  console.log('\n===== ES6+ =====');

  class Expense {
    constructor(description, amount, category = 'Other') {
      this.description = description;
      this.amount = amount;
      this.category = category;
    }

    label() {
      return `${this.description} (${this.category}): ₹${this.amount}`;
    }
  }

  const totalByCategory = (expenses) =>
    expenses.reduce((totals, { category, amount }) => ({ ...totals, [category]: (totals[category] ?? 0) + amount }), {});

  const loadExpenses = () =>
    new Promise((resolve) => setTimeout(() => resolve([new Expense('Chai', 20, 'Food'), new Expense('Metro', 500, 'Transport'), new Expense('Lunch', 150, 'Food')]), 10));

  try {
    console.log('let before declaration:', blockScoped);
  } catch (err) {
    console.log('let in TDZ →', err.name);
  }
  let blockScoped = 'now defined';

  const fns = [];
  for (let j = 0; j < 3; j++) fns.push(() => j);
  console.log('let in loop closure:', fns.map((f) => f()));

  try {
    const fixed = 1;
    fixed.valueOf();
    eval('fixed = 2');
  } catch (err) {
    console.log('const reassignment →', err.name);
  }

  const counter = {
    count: 0,
    start() {
      setTimeout(() => console.log('arrow function this.count:', this.count), 0);
    },
  };
  counter.start();

  loadExpenses().then(([first, ...rest]) => {
    console.log(first.label());
    console.log('rest length via destructuring:', rest.length);
    console.log(totalByCategory([first, ...rest]));
  });
}
