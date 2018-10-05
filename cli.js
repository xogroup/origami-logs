#!/usr/bin/env node

'use strict';
const prog = require('caporal');
const Hoek = require('hoek');
const path = require( 'path' );
const colorLogger = require('node-color-log');

const {
    githubClient,
    changelogGenerator,
    addToRelease
} = require('./lib/modules');
// const githubClient = require('./lib/modules/github-client');
// const changelogGenerator = require('./lib/modules/changelog-generator');
// const addToRelease = require('./lib/modules/add-to-release');
const helpers = require('./lib/modules/helpers');

const requireConfig = () => {
    try {
        const currentPath = path.resolve( '.' );

        return require(`${currentPath}/.origami-logs-config.json`);
    } catch (e) {
        return false;
    }
};

prog
    .version('1.0.0')
    .logger(colorLogger)
    .command('generate', 'Generates the changelog')
    .option('--github_api <apiUrl>', 'Github API URL (Used with Github Enterprise)')
    .option('--token <githubToken>', 'Github OAUTH Token')
    .option('--tags <tag1>,<tag2>', 'Gets the changelog between the tags', function(tags) {
        if (tags === true) {
            return [];
        }

        return tags.split(',');
    })
    .option('--release <pre>', 'Adds the given generated changelog to the release. If "pre" is passed, will mark as a pre-release')
    .action(async(args, options, logger) => {
        try {
            const config = requireConfig();
            const token = Hoek.reach(options, 'token') || Hoek.reach(config, 'github.token');
            const githubApi = Hoek.reach(options, 'githubApi') || Hoek.reach(config, 'github.apiUrl') || 'https://api.github.com';
            const tags = helpers.setTags(options.tags);
            let context;
            let client;
            let changelog;

            if (config || token && githubApi) {
                client = githubClient(githubApi, token);

                context = {
                    config,
                    client,
                    logger,
                    tags
                };

                changelog = await changelogGenerator.call(context);
                logger.color('green').bold().log('Changelog Generated as CHANGELOG.md');
            } else {
                throw new TypeError('Error: Config options are not set in command line or in .origami-logs-config.json. See --help to learn what you can send.');
            }

            if (options.release) {
                const release = await addToRelease.call(context, changelog, options.release);

                logger.color('green').bold().log(`RELEASE GENERATED FOR ${release.data.html_url}`);
            }
        } catch (e) {
            logger.error(e.message);
        }
    });

prog.parse(process.argv);
