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
  .command('<project> [options] ', 'Run sentinel against a specific project')
  .description('Test an app with a specific version of Electron')
  .action(async () => {
    const args = process.argv.slice(2);

    const project = args[0];
    if (!Object.keys(projects).includes(project)) {
      console.error(`Sentinel has not been configured to audit ${project}`);
      process.exit(1);
    }

    const statuses = await auditProject(projects[project]);
    const successes = statuses.filter(s => s).length
    console.info(`${successes}/${statuses.length} tests passed for project ${project}`)
  });

program.parseAsync(process.argv);
