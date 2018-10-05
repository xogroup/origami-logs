'use strict';
const Helpers = require('./helpers');

const generateChangelog = async function(comparedBranches, client, repo) {
    const changelog = {
        enhancement: [],
        bug        : []
    };

    for (const commit of comparedBranches.data.commits) {
        const searchResult = await client.search.issues({ q: commit.sha });
        console.log('THING', searchResult);
        if (searchResult.data.length) {
            let commitMessage = commit.commit.message;
            const multiLine = commitMessage.indexOf('\n');

            //Remove everything after the first line
            if (multiLine > 0) {
                commitMessage = commitMessage.substr(0, multiLine);
            }
            const { number, labels } = searchResult.data[0];

            let fauxContext = {
                repo,
                config: this.config
            };

            const entry = await Helpers.hydrateCommitEntry.call(fauxContext, commitMessage, number);

            for (const label of labels) {
                const labelName = Helpers.checkAliasLabels.call(this, label.name);

                if (changelog[labelName]) {
                    if (changelog[labelName].includes(entry)) {
                        continue;
                    }

                    changelog[labelName].push(entry);
                } else {
                    changelog[labelName] = [];
                    changelog[labelName].push(entry);
                }
            }
        }
    }

    return changelog;
};


module.exports = async function exports(client, tags) {
    const fs = require('fs');
    const config = this.config;

    const [owner, repo] = config.github.repository.split('/');
    const {tag1, tag2} = tags;

    try {
        // Initialize
        const repository = await client.repos.get({owner, repo});

        // Get the commits
        const comparedBranches = await client.repos.compareCommits({
            owner,
            repo,
            base: tag1,
            head: tag2
        });

        //Generate the changelog
        const changelog = await generateChangelog.call(this, comparedBranches, client, repository);
        // Format
        const formattedChangelog = Helpers.formatChangelog.call(this, changelog);
        const modifiedLog = Helpers.checkExtras.call(this, formattedChangelog);
        const finalChangelog = Helpers.formatForMarkdown.call(this, modifiedLog);

        // Write file to root of project
        return fs.writeFileSync('CHANGELOG.md', finalChangelog);
    } catch (e) {
        throw e;
    }
};
