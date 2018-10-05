'use strict';

const Lab = require('lab');
const fs = require('fs');
const sinon = require('sinon');
const logger = require('node-color-log');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, expect, before, after } = lab;


const {
    changelogGenerator,
    addToRelease
} = require('../lib/modules');

const config = require('../.origami-logs-config-template');

assertions.should();

describe('Integration', () =>{
    let context;
    let githubClient;

    before(() =>{
        const writeToFile = sinon.fake.returns(true);
        sinon.replace(fs, 'writeFileSync', writeToFile);

        const sampleCommit = {
            sha   : '4be33ee7ba38ee00ec2b3f3d96e0bbba553fbd65',
            commit: {
                author: {
                    name : 'JustNeph',
                    email: 'justneph@xogrp.com',
                    date : '2017-12-05T17:02:34Z'
                },
                committer: {
                    name : 'Github',
                    email: 'github@github.com',
                    date : '2017-12-05T17:02:34Z'
                },
                message: '[#1234567] Adds a fix to properly return the internal mediaSummary … (#31)\n\n* [#153019762] Adds a fix to properly return the internal mediaSummary structure for Limited vendors\r\n\r\n* Changed let to const in test'
            }
        };

        githubClient = {
            repos: {
                compareCommits: function() {
                    return {
                        data: {
                            commits: [sampleCommit]
                        }
                    };
                },
                getReleaseByTag: function() {
                    return {
                        data: {
                            id      : '12345',
                            html_url: 'https://www.github.com/someOrg/justneph/pulls/12345'
                        }
                    };
                },
                editRelease: function() {
                    return true;
                }
            },
            pullRequests: {
                get: function() {
                    return Promise.resolve({
                        data: {
                            url : 'https://www.github.com/someOrg/justneph/pull/31',
                            user: {
                                login: 'nrodriguez',
                                url  : 'https://api.github.com/users/nrodriguez'
                            }
                        }
                    });
                }
            },
            search: {
                issues: function() {
                    return {
                        data: {
                            total_count: 1,
                            items      : [{
                                name  : 'TEST',
                                number: '1234',
                                labels: [{
                                    name: 'enhancement'
                                }]
                            }]
                        }
                    };
                }
            }
        };

        context = {
            config,
            client: githubClient,
            tags  : {
                tag1: 'v1.0.0',
                tag2: 'v2.0.0'
            },
            logger
        };
    });

    after(() =>{
        sinon.restore();
    });


    it('generates the CHANGELOG.md file with the expected changelog', async() =>{
        const expected = '**Features Implemented:**\n* [[#1234567]](https://www.pivotaltracker.com/n/projects/1234567/stories/1234567) Adds a fix to properly return the internal mediaSummary … [(#31)](https://www.github.com/someOrg/justneph/pull/31) [nrodriguez](https://api.github.com/users/nrodriguez)\n';
        await changelogGenerator.call(context, ['v1.2.1', 'HEAD']);
        expect(fs.writeFileSync.lastArg).to.equal(expected);
    });

    it('pushes the releases notes to github', async() =>{
        sinon.spy(githubClient.repos, 'getReleaseByTag');
        sinon.spy(githubClient.repos, 'editRelease');

        const changelog = '**Features Implemented:**\n* [[#1234567]](https://www.pivotaltracker.com/n/projects/1234567/stories/1234567) Adds a fix to properly return the internal mediaSummary … [(#31)](https://www.github.com/someOrg/justneph/pull/31) [nrodriguez](https://api.github.com/users/nrodriguez)\n';
        await addToRelease.call(context, changelog, 'test');

        expect(githubClient.repos.getReleaseByTag.getCall(0).lastArg).to.deep.equal({
            owner: 'Organization',
            repo : 'repo-name',
            tag  : 'v2.0.0'
        });

        expect(githubClient.repos.editRelease.getCall(0).lastArg).to.deep.equal({
            owner     : 'Organization',
            repo      : 'repo-name',
            release_id: '12345',
            body      : changelog,
            prerelease: false
        });
    });
});
