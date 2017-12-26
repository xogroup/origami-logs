'use strict';

module.exports = async function(commitMessage, issueNumber) {
    const pullRequestNumber = new RegExp(/(\(#\d+\))/);
    const numberToReplace = commitMessage.match(pullRequestNumber)[0];
    let message;
    let author;

    const pullRequest = await this.repo.getPullRequest(issueNumber);

    message = commitMessage.replace(numberToReplace, `[${numberToReplace}](${pullRequest.data.url})`);
    author = `[${pullRequest.data.user.login}](${pullRequest.data.user.url})`;

    return `${message} ${author}`;
};
