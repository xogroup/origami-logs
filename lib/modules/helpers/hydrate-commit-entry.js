'use strict';
const Hoek = require('@hapi/hoek');

module.exports = async function(commitMessage, issueNumber) {
    const pullRequestNumber = new RegExp(/(\(#\d+\))/);
    const numberToReplace = Hoek.reach(
        commitMessage.match(pullRequestNumber),
        '0'
    );
    const pullRequest = await this.client.pullRequests.get(Hoek.merge(this.ownerRepo, {number: issueNumber}));
    const message = commitMessage.replace(numberToReplace, `[${numberToReplace}](${pullRequest.data.url})`);
    const author = `[${pullRequest.data.user.login}](${pullRequest.data.user.url})`;

    return `${message} ${author}`;
};
