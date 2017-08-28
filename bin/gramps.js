#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const shell = require('shelljs');
const globby = require('globby');
const babel = require('babel-core');
const argv = require('yargs')
  .group('data-source-dir', 'Register a data source for mock development:')
  .options({
    'data-source-dir': {
      alias: 'd',
      description: 'path to a data source directory',
      default: '',
    },
  })
  .group(['live', 'mock'], 'Choose real or mock data:')
  .options({
    live: {
      alias: 'l',
      conflicts: 'mock',
      description: 'run GraphQL with live data',
    },
    mock: {
      alias: 'm',
      conflicts: 'live',
      description: 'run GraphQL offline with mock data',
    },
  })
  .help()
  .alias('help', 'h').argv;

const LIVE_DATA_ENV = 'production';
const MOCK_DATA_ENV = 'development';

/**
 * Prints a notice to the console when using mock data sources.
 * @param  {string} srcDir  path to the data source directory
 * @param  {string} tmpDir  path to the temporary directory
 * @return {void}
 */
function printDevWarning(srcDir, tmpDir) {
  const red = chalk.red.bold;
  shell.echo(red('\n======================= IMPORTANT ======================'));
  shell.echo(red('   External data sources are for development only'));
  shell.echo(red('   and WILL NOT work in a live environment. For info'));
  shell.echo(red('   on putting your data source in production, see'));
  shell.echo(red('   the docs at https://ibm.biz/graphql-data-source'));
  shell.echo(red('========================================================\n'));
  shell.echo(chalk.dim(`Source: ${srcDir}`));
  shell.echo(chalk.dim(`Compiled: ${tmpDir}\n`));
}

/**
 * Creates an empty temporary directory and returns the path.
 * @param  {string} tmpDir  path to the temporary directory
 * @return {void}
 */
function makeTmpDir(tmpDir) {
  shell.echo(chalk.dim(' -> emptying the temporary directory...'));
  shell.rm('-rf', tmpDir);
  shell.mkdir(tmpDir);
  shell.echo(chalk.dim(' -> created an empty temporary directory'));
}

/**
 * Copies GraphQL files to a target directory.
 * @param  {string} fileGlob   file glob following globby patterns
 * @param  {string} targetDir  file glob following globby patterns
 * @return {void}
 */
function copyGQL(fileGlob, targetDir) {
  globby.sync(fileGlob).forEach(file => {
    shell.cp(file, targetDir);
    shell.echo(chalk.dim(` -> copied ${path.basename(file)}`));
  });
}

/**
 * Transpiles JavaScript files using Babel and saves them to a target directory.
 * @param  {string} fileGlob   file glob following globby patterns
 * @param  {string} targetDir  where to save transpiled files
 * @return {void}
 */
function transpileJS(fileGlob, targetDir) {
  globby.sync(fileGlob).forEach(file => {
    const fileName = path.basename(file);
    const tmpFile = path.join(targetDir, fileName);
    const transpiled = babel.transformFileSync(file);

    shell.touch(tmpFile);
    shell.ShellString(transpiled.code).to(tmpFile);
    shell.echo(chalk.dim(` -> transpiled ${fileName}`));
  });
}

/**
 * Preps and saves a data source in a temp directory, and returns the temp path.
 * @param  {string} rootDir         GraphQL µ-service root directory
 * @param  {string} relativeSrcDir  relative path to a data source directory
 * @return {string}                 env var if set, otherwise an empty string
 */
function getDataSource(rootDir, relSrcDir) {
  if (!relSrcDir || !shell.test('-d', relSrcDir)) {
    if (relSrcDir) {
      shell.echo(chalk.red.bold(`Data source ${relSrcDir} does not exist.`));
    }

    return '';
  }

  const srcDir = path.join(process.cwd(), relSrcDir);
  const tmpDir = path.join(rootDir, '.tmp');

  shell.echo(`Loading %{srcDir}`);

  printDevWarning(srcDir, tmpDir);
  makeTmpDir(tmpDir);
  copyGQL(path.join(srcDir, 'src/*.graphql'), tmpDir);
  transpileJS(path.join(srcDir, 'src/*.js'), tmpDir);

  shell.echo(chalk.bold('\r\nWe’ve got ourselves a data source, folks.'));
  shell.echo(chalk.bold('Who’s ready to party? 🎉'));

  return `GQL_DATA_SOURCES=${tmpDir}`;
}

// Get the full path to the GraphQL µ-service root directory
const rootDir = path.resolve(__dirname, '..');
const env = argv.live ? LIVE_DATA_ENV : MOCK_DATA_ENV;
const source = getDataSource(rootDir, argv.dataSourceDir);

// Move into the root Node directory and start the service.
shell.cd(rootDir);
shell.exec(`${source} NODE_ENV=${env} node dist/dev/server.js`);
