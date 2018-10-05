'use strict';
const Hoek = require('hoek');

module.exports = async function(commitMessage, issueNumber) {
    const pullRequestNumber = new RegExp(/(\(#\d+\))/);
    const numberToReplace = Hoek.reach(
        commitMessage.match(pullRequestNumber),
        '0'
    );
    let message;
    let author;
    const pullRequest = await this.client.pullRequests.get(Hoek.merge(this.ownerRepo, {number: issueNumber}));
    message = commitMessage.replace(numberToReplace, `[${numberToReplace}](${pullRequest.data.url})`);
    author = `[${pullRequest.data.user.login}](${pullRequest.data.user.url})`;

    return `${message} ${author}`;
};
