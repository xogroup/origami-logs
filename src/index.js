'use strict';
const prog = require('caporal');
const githubClient = require('./modules/github_client');
const changelogGenerator = require('./modules/changelog_generator');
const config = require('../.changelog-generator-config.json');
const Helpers = require('./modules/helpers');


prog
    .version('1.0.0')
    .command('generate', 'Generates the changelog')
    .option('--github_api <apiUrl>', 'Github API URL (Used with Github Enterprise)')
    .option('--token <githubToken>', 'Github OAUTH Token')
    .option('--tags <tag1>,<tag2>', 'Gets the changelog between the tags. Defaults to the current tag and the HEAD', function(tags) {
        if (tags === true) {
            return [];
        }

        return tags.split(',');
    })
    .action((args, options, logger) => {
        try {
            const tags = Helpers.setTags(options.tags);
            const token = options.token || config.github.token;
            const githubApi = options.githubApi || config.github.apiUrl || 'https://api.github.com';

            if (token && githubApi) {
                const client = githubClient(githubApi, token);
                changelogGenerator(client, tags);
                logger.info('Changelog Generated as CHANGELOG.md');
            } else {
                throw new Error('Configs are not set in command line or in .changelog-generator-config.json');
            }
        } catch (e) {
            logger.error(e.message);
        }


    // Process to generate changelog
    // 1) Get repo
    // 2) COMPARE between tags to get commits to get messages
    // 3) FInd PRS from commits
    // 4) GET LABEL FROM ISSUES ON PR
    // 5) COmpile to changelog

    // repo.listTags().then((response) => {
    //   console.log(response.data);
    // });
    // args and options are objects
    // args = {"app": "myapp", "env": "production"}
    // options = {"tail" : 100}
    });
// you specify arguments using .argument()
// 'app' is required, 'env' is optional
// .command('deploy', 'Deploy an application')
// .argument('<app>', 'App to deploy', /^myapp|their-app$/)
// .argument('[env]', 'Environment to deploy on', /^dev|staging|production$/, 'local')
// // you specify options using .option()
// // if --tail is passed, its value is required
// .option('--tail <lines>', 'Tail <lines> lines of logs after deploy', prog.INT)
// .action((args, options, logger) => {
//   // args and options are objects
//   // args = {"app": "myapp", "env": "production"}
//   // options = {"tail" : 100}
// });

prog.parse(process.argv);

// module.exports = Greetings.init;
