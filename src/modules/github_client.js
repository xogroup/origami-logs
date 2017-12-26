const GitHub = require('github-api');
const config = require('../../.changelog-generator-config.json');

module.exports = function githubClient(apiBase, token) {
  return new GitHub({ token }, apiBase);
};
