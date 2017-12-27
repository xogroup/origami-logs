'use strict';

module.exports = function formatForMarkdown(changelog) {
    let log = '';

    // Format for Markdown
    Object.keys(changelog).forEach((changeset) => {
        log += `\n\n**${changeset}**\n`;

        changelog[changeset].forEach((change) => {
            log += `* ${change}\n`;
        });
    });

    return log;
};
