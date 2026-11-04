import repl from 'node:repl';
import fs from 'node:fs';
import path from 'node:path';

const session = repl.start({ prompt: 'finsight> ', useColors: true });

Object.assign(session.context, { fs, path });

try {
  const database = await import('@finsight/database');
  Object.assign(session.context, database, database.models);
  console.log('Loaded @finsight/database. Try: await User.count()');
} catch (err) {
  console.log(`@finsight/database not available yet (${err.code}). Plain REPL with fs and path in context.`);
}

session.defineCommand('hello', {
  help: 'Say hello from a custom REPL command',
  action(name) {
    this.clearBufferedCommand();
    console.log(`Hello ${name || 'FinSight'}`);
    this.displayPrompt();
  },
});
