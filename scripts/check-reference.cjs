// Executes only synthetic domain/API suites from the inspected reference checkout.
// Does not start the legacy app or connect to production storage.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const swc = require('next/dist/build/swc');

(async () => {
  const root = path.resolve(__dirname, '..');
  const source = path.join(root, 'references/private/site-source');
  const output = path.join(root, 'references/private/legacy-checks');
  const suites = ['workflows', 'planner', 'permissions', 'export', 'indicators', 'indicator-review'];
  if (!fs.existsSync(path.join(source, 'lib/model.ts'))) throw new Error('Retrieve the reference source before running this inspection check.');
  await swc.loadBindings();
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'package.json'), '{"type":"commonjs"}\n');
  for (const directory of ['lib', 'tests']) {
    fs.mkdirSync(path.join(output, directory), { recursive: true });
    for (const file of fs.readdirSync(path.join(source, directory)).filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))) {
      const input = path.join(source, directory, file);
      const result = await swc.transform(fs.readFileSync(input, 'utf8'), {
        filename: input, jsc: { parser: { syntax: 'typescript' }, target: 'es2022' }, module: { type: 'commonjs' }
      });
      fs.writeFileSync(path.join(output, directory, file.replace(/\.ts$/, '.js')), result.code);
    }
  }
  console.log('Reference suites: SWC transpilation only; this is not a legacy typecheck or live integration test.');
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=spec', ...suites.map(s => path.join(output, 'tests', s + '.js'))], { encoding: 'utf8' });
  const report = (run.stdout || '') + (run.stderr || '');
  fs.writeFileSync(path.join(output, 'results.txt'), report);
  process.stdout.write(report);
  if (run.error) throw run.error;
  process.exitCode = run.status ?? 1;
})().catch(error => { console.error(error.message); process.exitCode = 1; });
