#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const program = require('commander');

const { auditProject } = require('../lib/index');

const jsonPath = path.resolve(__dirname, '../src/projects.json');
const data = fs.readFileSync(jsonPath);
const projects = JSON.parse(data.toString());

program.description('Electron ecosystem test tool').usage('<command> [commandArgs...]');

program
  .command('[options]', 'Run sentinel against a specific project')
  .description('Test an app with a specific version of Electron')
  .option('-ev, --electronVersion <version>', 'The Electron version to test against')
  .option('-p, --path <path>', 'Absolute path to a locally built version of Electron')
  .action(async () => {
    const project = process.argv.slice(2)[0];
    if (!Object.keys(projects).includes(project)) {
      console.error(`Sentinel has not been configured to audit ${project}`);
      process.exit(1);
    }

    const statuses = await auditProject(projects[project], program.opts());
    const successes = statuses.filter(s => s).length;
    console.info(`${successes}/${statuses.length} tests passed for project ${project}`)
  })
  .on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ sentinel spectron --version=v8.0.0-beta.8');
    console.log('  $ sentinel spectron --local');
  })
  .parseAsync(process.argv);
