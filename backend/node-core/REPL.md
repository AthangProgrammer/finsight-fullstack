# Node REPL (M4.11)

Start it with `node` (no file). The prompt is `>`. Exit with `.exit` or Ctrl+D.

## Recorded session

```text
$ node
Welcome to Node.js v22.x.
Type ".help" for more information.
> .help
.break    Sometimes you get stuck, this gets you out
.clear    Alias for .break
.editor   Enter editor mode
.exit     Exit the REPL
.help     Print this help message
.load     Load JS from a file into the REPL session
.save     Save all evaluated commands in this REPL session to a file

Press Ctrl+C to abort current expression, Ctrl+D to exit the REPL
> 12000 * 0.18
2160
> _ + 40
2200
> const expenses = [{ amount: 20 }, { amount: 500 }, { amount: 150 }]
undefined
> expenses.reduce((t, e) => t + e.amount, 0)
670
> .editor
// Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)
const total = (rows) => rows.reduce((t, r) => t + r.amount, 0);
const average = (rows) => total(rows) / rows.length;
average(expenses)
223.33333333333334
> const path = require('node:path')
undefined
> path.parse('/data/expenses.csv')
{ root: '/', dir: '/data', base: 'expenses.csv', ext: '.csv', name: 'expenses' }
> Buffer.from('₹')
<Buffer e2 82 b9>
> Buffer.from('₹').toString('base64')
'4oK5'
> await import('node:os').then(m => m.cpus().length)
8
> .save session.js
Session saved to: session.js
> .clear
> .load session.js
```

## What to point out in the viva

| Feature | What it shows |
|---|---|
| `_` | the result of the last expression |
| `_error` | the last thrown error |
| `.editor` | multi-line input; Ctrl+D runs it |
| Tab | autocomplete on built-in modules and properties |
| Up arrow | history, kept between sessions |
| `.save` / `.load` | persist and replay a session |
| top-level `await` | works in the REPL without wrapping in `async` |
| built-in modules | `fs`, `path`, `os` and others are available without `require` |

## Custom REPL: `repl.js`

```bash
node backend/node-core/repl.js
```

`repl.js` uses `node:repl` to start a REPL with `fs` and `path` already in context and a custom `.hello` command. Once Phase 3 lands it also imports `@finsight/database`, so the models are available directly:

```text
finsight> await Expense.count()
60
finsight> (await Category.findAll()).map(c => c.name)
```
