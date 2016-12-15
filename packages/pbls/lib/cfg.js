const { homedir } = require('os');
const path = require('path');
const fs = require('fs');

const FILE_PATH = path.resolve(homedir(), '.pbls.json');

const read = () => {
  try {
    const fileData = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(fileData);
  } catch (err) {
    return {};
  }
};

const update = (data) => {
  const cfg = Object.assign({}, read(), data);
  fs.writeFileSync(FILE_PATH, JSON.stringify(cfg, null, 2));
};

module.exports = {
  read,
  update,
};
