const fs = require('fs');
const winston = require('winston');
const { spawnSync } = require('child_process');
const { store }= require('@devly/devly-store');

function initShell(shellExports, filePath) {
  let data = fs.readFileSync(filePath, 'utf8');
  let result = data;
  let newLines = '';

  for( let shellExport  of shellExports ){
    const { name, value } = shellExport;
    if( result.indexOf(`export ${name}`) === -1 ){
      newLines = `${newLines}export ${name}=${value}\n`;
    } else {
      result = result.replace(new RegExp(`export ${name}=.+`,'gm'), `${newLines}export ${name}=${value}`) ;
    }
  }

  if (newLines || data !== result) {
    if (newLines) {
      result = `${newLines}\n${result}`;
    }
    fs.writeFileSync(filePath, result, 'utf8');
    spawnSync(`source ${filePath}`, [], {
      shell: true,
      stdio: 'inherit',
    });
  } else {
    winston.log('info', 'There is nothing to update in shell profile.');
  }
  return true;
}

module.exports = class Shell {
  init() { // eslint-disable-line class-methods-use-this
    const {exports: shellExports, path: filePath } = store.getState().shell;
    return initShell(shellExports, filePath);
  }
};
