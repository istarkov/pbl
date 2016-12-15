#!/usr/bin/env node
const minimist = require('minimist');
const { execSync } = require('child_process');

const args = minimist(process.argv.slice(2));


if (args._[0] === 'install') {
  const execOptions = {
    encoding: 'utf8',
    cwd: `${__dirname}`,
    stdio: [
      'inherit', // stdin (default)
      'inherit', // stdout (default)
      'inherit'  // stderr
    ]
  };

  const code = execSync('npm run postinstall', execOptions);
  process.exit(code);
}
