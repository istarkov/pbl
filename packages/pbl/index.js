#!/usr/bin/env node
/* eslint-disable no-console */
// pbl init --identity {SSH-IDENTITY-FILE-PATH} --server {YOUR-SERVER-HOST-OR-IP}

const chalk = require('chalk');
const minimist = require('minimist');
const cfg = require('./lib/cfg');
const { execSync } = require('child_process');
const uuidV4 = require('uuid/v4');


const args = minimist(process.argv.slice(2));

const showHelp = (txt) => {
  if (txt) {
    console.log(txt);
  }

  console.log(`
    pbl usage:
      initialization:
        pbl init --identity {SSH-IDENTITY-FILE-PATH} --server {YOUR-SERVER-HOST-OR-IP}
      run:
        pbl
        pbl --name hello
  `);
};

if (args._[0] === 'help' || 'help' in args) {
  showHelp();
}

if (args._[0] === 'init') {
  const { identity, server } = args;

  if (!server) {
    console.log(`
      ${chalk.red('pbl init syntax error')}
      you must specify ${chalk.bold('server')} argument with domain or ip
      like:
      ${chalk.bold('pbl init --server ubuntu@mydomain.com')}
    `);

    process.exit(1);
  }

  const { server: prevServer, identity: prevIdentity } = cfg.read();
  cfg.update({ server, identity });

  if (prevServer !== server) {
    console.log(`
      Server has changed:
        new: ${chalk.bold(server)}
        old: ${chalk.red(prevServer)}
    `);
  }

  if (prevIdentity !== identity) {
    console.log(`
      Identity has changed:
        new: ${chalk.bold(identity)}
        old: ${chalk.red(prevIdentity)}
    `);
  }

  process.exit(0);
}

const {
  name = uuidV4().slice(0, 8),
  dockerFile = 'Dockerfile',
  // domain = '',
} = args;

const { server, identity } = cfg.read();

if (!server) {
  showHelp(`
    ${chalk.red('server is not specified')}
    please run ${chalk.red('pbl init --server {USER@SERVER OR IP}')}
  `);
  process.exit(1);
}

// split with -- run and ssh params
const execParams = `${__dirname}/scripts/run.sh ` +
  `-n ${name} -f ${dockerFile} ` +
 `${identity ? `-i ${identity}` : ''} -s ${server}`;


const execOptions = {
  encoding: 'utf8',
  cwd: process.cwd(),
  stdio: [
    'inherit', // stdin (default)
    'inherit', // stdout (default)
    'inherit'  // stderr
  ]
};

execSync(execParams, execOptions);
