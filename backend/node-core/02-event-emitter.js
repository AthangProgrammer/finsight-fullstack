import { EventEmitter } from 'node:events';

class BudgetMonitor extends EventEmitter {
  #spent = 0;

  constructor(limit, warnAt = 0.8) {
    super();
    this.limit = limit;
    this.warnAt = warnAt;
  }

  spend(amount) {
    const before = this.#spent;
    this.#spent += amount;
    const ratio = this.#spent / this.limit;

    if (this.#spent > this.limit && before <= this.limit) {
      this.emit('exceeded', { spent: this.#spent, limit: this.limit });
    } else if (ratio >= this.warnAt && before / this.limit < this.warnAt) {
      this.emit('threshold', { spent: this.#spent, percent: Math.round(ratio * 100) });
    }
    return this.#spent;
  }
}

const monitor = new BudgetMonitor(10000);

const onThreshold = ({ spent, percent }) => console.log(`[on] threshold: ₹${spent} (${percent}%)`);
monitor.on('threshold', onThreshold);
monitor.once('exceeded', ({ spent, limit }) => console.log(`[once] exceeded: ₹${spent} > ₹${limit}`));

console.log('listeners for threshold:', monitor.listenerCount('threshold'));
monitor.spend(5000);
monitor.spend(3500);
monitor.spend(2000);
monitor.spend(500);
console.log('listeners for exceeded after once fired:', monitor.listenerCount('exceeded'));

monitor.off('threshold', onThreshold);
console.log('listeners for threshold after off:', monitor.listenerCount('threshold'));

const fresh = new BudgetMonitor(1000);
fresh.on('error', (err) => console.log('error event handled:', err.message));
fresh.emit('error', new Error('bad ledger'));
