const prog = require('caporal');
const githubClient = require('./modules/github_client');
const changelogGenerator = require('./modules/changelog_generator');

prog
  .version('1.0.0')
  .command('generate', 'Generates the changelog')
  .option('--github_api <apiUrl>', 'Github API URL (Used with Github Enterprise)')
  .option('--token <githubToken>', 'Github OAUTH Token')
  .action((args, options, logger) => {
    const client = githubClient(options.githubApi, options.token);
    changelogGenerator(client);

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
