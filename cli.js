'use strict';
const prog = require('caporal');
const Hoek = require('hoek');

const githubClient = require('./lib/modules/github_client');
const changelogGenerator = require('./lib/modules/changelog_generator');
const helpers = require('./lib/modules/helpers');

const requireConfig = () => {
    try {
        return require('./.changelog-generator-config.json');
    } catch (e) {
        return false;
    }
};

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
    .action(async(args, options, logger) => {
        try {
            const config = requireConfig();
            const token = Hoek.reach(options, 'token') || Hoek.reach(config, 'github.token');
            const githubApi = Hoek.reach(options, 'githubApi') || Hoek.reach(config, 'github.apiUrl') || 'https://api.github.com';
            const tags = helpers.setTags(options.tags);
            const context = {
                config
            };

            if (config || token && githubApi) {
                const client = githubClient(githubApi, token);
                await changelogGenerator.call(context, client, tags);
                logger.info('Changelog Generated as CHANGELOG.md');
            } else {
                throw new TypeError('Error: Config options are not set in command line or in .changelog-generator-config.json. See --help to learn what you can send.');
            }
        } catch (e) {
            logger.error(e.message);
        }
    });

prog.parse(process.argv);
