'use strict';
const Helpers = require('./helpers');

const generateChangelog = async function(comparedBranches, ownerRepo) {
    const client = this.client;
    const changelog = {
        enhancement: [],
        bug        : []
    };

    for (const commit of comparedBranches.data.commits) {
        const searchResult = await client.search.issues({ q: commit.sha });

        if (searchResult.data.total_count > 0) {
            let commitMessage = commit.commit.message;

            const multiLine = commitMessage.indexOf('\n');
            //Remove everything after the first line
            if (multiLine > 0) {
                commitMessage = commitMessage.substr(0, multiLine);
            }
            const { number, labels } = searchResult.data.items[0];

            let fauxContext = {
                client,
                ownerRepo,
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


module.exports = async function exports() {
    const fs = require('fs');
    const client = this.client;
    const config = this.config;
    const [owner, repo] = config.github.repository.split('/');
    const ownerRepo = {owner, repo};

    const {tag1, tag2} = this.tags;

    try {
        // Get the commits
        const comparedCommits = await client.repos.compareCommits(Object.assign(ownerRepo, {
            base: tag1,
            head: tag2
        }));

        //Generate the changelog
        const changelog = await generateChangelog.call(this, comparedCommits, ownerRepo);

        // Format
        const formattedChangelog = Helpers.formatChangelog.call(this, changelog);
        const modifiedLog = Helpers.checkExtras.call(this, formattedChangelog);
        const finalChangelog = Helpers.formatForMarkdown.call(this, modifiedLog);

        // Write file to root of project
        fs.writeFileSync('CHANGELOG.md', finalChangelog);

        return finalChangelog;
    } catch (e) {
        throw e;
    }
};
