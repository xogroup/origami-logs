'use strict';

const fs = require('fs');
const config = require('../../.changelog-generator-config.json');
const Helpers = require('./helpers');

const writeToFile = function writeToFile(changelog) {
    return fs.writeFileSync('CHANGELOG.md', changelog);
};

const generateChangelog = async function(comparedBranches, client, repo) {
    const changelog = {
        enhancement: [],
        bug        : []
    };

    for (const commit of comparedBranches.data.commits) {
        const searchResult = await client.search().forIssues({ q: commit.sha });

        if (searchResult.data.length) {
            let commitMessage = commit.commit.message;
            const multiLine = commitMessage.indexOf('\n');

            if (multiLine > 0) {
                commitMessage = commitMessage.substr(0, multiLine);
            }

            const { number, labels } = searchResult.data[0];

            let fauxContext = {
                repo
            };

            const entry = await Helpers.hydrateCommitEntry.call(fauxContext, commitMessage, number);

            for (const label of labels) {
                const labelName = Helpers.checkAliasLabels(label.name);

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
    const [org, repository] = config.github.repository.split('/');
    const {tag1, tag2} = tags;

    try {
        // Initialize
        const repo = await client.getRepo(org, repository);
        // const issues = await client.getIssues(org, repository);

        // Generate changelog
        console.log(tag2);
        const comparedBranches = await repo.compareBranches('v1.2.0', tag2);
        const finalChangeLog = await generateChangelog(comparedBranches, client, repo);

        // Format
        const formattedChangelog = Helpers.formatChangelog(finalChangeLog);
        const modifiedLog = Helpers.checkExtras(formattedChangelog);
        const payload = Helpers.formatForMarkdown(modifiedLog);

        // Write file to root of project
        writeToFile(payload);
    } catch (e) {
        throw e;
    }
};
