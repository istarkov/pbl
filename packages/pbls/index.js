#!/usr/bin/env node
/* eslint-disable no-console */
const chalk = require('chalk');
const minimist = require('minimist');
const fs = require('fs');
const { execSync } = require('child_process');
const cfg = require('./lib/cfg');
const uuidV4 = require('uuid/v4');

const args = minimist(process.argv.slice(2));

if (args._[0] === 'init') {
  const { domain } = args;

  const execOptions = {
    encoding: 'utf8',
    cwd: `${__dirname}`,
    stdio: [
      'inherit', // stdin (default)
      'inherit', // stdout (default)
      'inherit'  // stderr
    ]
  };

  const code = execSync(`${__dirname}/scripts/install.sh`, execOptions);

  if (code) {
    process.exit(code);
  }

  if (!domain) {
    console.log(`
      ${chalk.red('pbls init syntax error')}
      you must specify domain name
      like:
      ${chalk.bold('pbls init --domain mydomain.com')}
    `);

    process.exit(1);
  }

  const { domain: prevDomain } = cfg.read();
  cfg.update({ domain });

  console.log(`
    Domain changed:
      new: ${chalk.bold(domain)}
      old: ${chalk.bold(prevDomain)}
  `);

  process.exit(0);
}

if (args._[0] === 'run') {
  const {
    name = uuidV4().slice(0, 8),
    dockerFile = 'Dockerfile',
    dir,
  } = args;

  if (!dir) {
    console.log(`
      ${chalk.bold('pbls run')} command ${chalk.red('syntax error')}
      you must specify project directory path
      like:
      ${chalk.bold('pbls run --dir /tmp/somename')}
    `);

    process.exit(1);
  }

  if (!fs.existsSync(dir)) {
    console.log(`
      ${chalk.red(`Directory ${chalk.bold(dir)} not exists`)}
    `);

    process.exit(1);
  }

  const { domain } = cfg.read();

  if (!domain) {
    console.log(`
      ${chalk.red('Domain is not specified')}
      Please run at server ${chalk.bold('pbls init --domain mydomain.com')}
    `);

    process.exit(1);
  }

  const execOptions = {
    encoding: 'utf8',
    cwd: dir,
    stdio: [
      'inherit', // stdin (default)
      'inherit', // stdout (default)
      'inherit'  // stderr
    ]
  };

  console.log(`
Starting container
-----------------------------------------------
${chalk.bold(`http://${name}.${domain}`)}
-----------------------------------------------
  `);

  const argsA = ['--name', '--dockerFile', '--dir']
    .reduce(
      (r, v) => {
        const idx = r.indexOf(v);

        if (idx > -1) {
          return [...r.slice(0, idx), ...r.slice(idx + 2)];
        }

        return r;
      },
      process.argv.slice(3)
    );

  const code = execSync(
    `${__dirname}/scripts/run.sh -n ${name} -d ${domain} -f ${dockerFile} -- ${argsA.join(' ')}`,
    execOptions
  );
  process.exit(code);
}