'use strict';
const GitHub = require('github-api');

module.exports = function githubClient(apiBase, token) {
    return new GitHub({ token }, apiBase);
};
