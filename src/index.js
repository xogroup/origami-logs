'use strict';
const prog = require('caporal');
const githubClient = require('./modules/github_client');
const changelogGenerator = require('./modules/changelog_generator');
const config = require('../.changelog-generator-config');
const Helpers = require('./modules/helpers');


prog
    .version('1.0.0')
    .command('generate', 'Generates the changelog')
    .option('--github_api <apiUrl>', 'Github API URL (Used with Github Enterprise)')
    .option('--token <githubToken>', 'Github OAUTH Token')
    .option('--tags <tag1>,<tag2>', 'Gets the changelog between the tags', function(tags) {
        if (tags === true) {
            return [];
        }

        return tags.split(',');
    })
    .action((args, options, logger) => {
        try {
            const tags = Helpers.setTags.call(this, options.tags);
            const token = options.token || config.github.token;
            const githubApi = options.githubApi || config.github.apiUrl || 'https://api.github.com';

            if (token && githubApi) {
                const client = githubClient(githubApi, token);
                this.config = config;
                changelogGenerator.call(this, client, tags);
                logger.info('Changelog Generated as CHANGELOG.md');
            } else {
                throw new Error('Configs are not set in command line or in .changelog-generator-config.json');
            }
        } catch (e) {
            logger.error(e.message);
        }
    });

prog.parse(process.argv);
