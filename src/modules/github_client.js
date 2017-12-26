const GitHub = require('github-api');
const config = require('../../.changelog-generator-config.json');

module.exports = function githubClient(apiBase, githubToken) {
  const token = githubToken || config.github.token;
  const githubApi = apiBase || config.github.apiUrl || 'https://api.github.com';

  if (token && githubApi) {
    return new GitHub({ token }, githubApi);
  }
  return 'Configs are not set in command line or in .changelog-generator-config.json';
};
