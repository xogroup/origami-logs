'use strict';
const GitHub = require('github-api');

module.exports = function githubClient(apiBase, token) {
    const octokit = require('@octokit/rest')({
        baseUrl: apiBase
    });

    octokit.authenticate({
        type : 'token',
        token: token
    });

    return octokit;
};
