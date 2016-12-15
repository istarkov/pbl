#!/usr/bin/env node

const ora = require('ora');
const spinners = require('cli-spinners');
const chalk = require('chalk');

const spinnerNames = Object.keys(spinners).reverse();

function run(idx) {
  if (idx >= spinnerNames.length) return;
  const spinner = ora({
    text: `Loading ${chalk.green(spinnerNames[idx])}`,
    spinner: spinnerNames[idx]
  }).start();

  setTimeout(
    () => {
      spinner.text = `Loading ${chalk.green(spinnerNames[idx])} ${chalk.grey('done')}`;
      spinner.stopAndPersist(chalk.green('✓'));
      run(idx + 1);
    },
    2000
  );
}

run(0);
