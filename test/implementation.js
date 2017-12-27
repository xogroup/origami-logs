'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, after } = lab; //expect
const config = require('../.changelog-generator-config.json');
let git = require('git-rev-sync');
const Hoek = require('hoek');
const Promise = require('bluebird');
const Helpers = require('../src/modules/helpers');
assertions.should();

describe('Implementation', () => {
    const context = {
        repo: {
            getPullRequest: function() {
                return Promise.resolve({
                    data: {
                        url : 'google.com',
                        user: {
                            login: 'nrodriguez',
                            url  : 'https://api.github.com/users/nrodriguez'
                        }
                    }
                });
            }
        }
    };

    describe('hydrateCommitEntry()', () => {
        it('hydrates the commit with the url to the commit and author', async() => {
            const inputCommit = '[#153412695] Fix mediaSummary count (#32)';
            const hydratedCommit = '[#153412695] Fix mediaSummary count [(#32)](google.com) [nrodriguez](https://api.github.com/users/nrodriguez)';
            const subject = await Helpers.hydrateCommitEntry.call(context, inputCommit, '123');

            subject.should.equal(hydratedCommit);
        });
    });

    describe('checkAliasLabels()', () =>{
        it('checks if a label matches the aliases set and returns it', () =>{
            const inputLabel = 'feature';
            const expectedLabel = 'enhancement';

            Helpers.checkAliasLabels(inputLabel).should.equal(expectedLabel);
        });
    });

    describe('checkExtras()', () =>{
        const ogExtrasConfig = Hoek.clone(config.extras);

        after(() =>{
            config.extras = ogExtrasConfig;
        });

        describe('with pivotal enabled', () =>{
            const configExample = {
                extras: {
                    pivotal: {
                        boardID: '1234567'
                    }
                }
            };

            config.extras = configExample.extras;

            it('adds the pivotal link with the matching story id', () =>{
                const input = {
                    'Features Implemented:': [
                        '[#153425732] Refactor testing strategy [(#33)](https://some-git-pr-url) [justneph](https://some-git-user-url)'
                    ]
                };
                const expected = {
                    'Features Implemented:': [
                        '[[#153425732]](https://www.pivotaltracker.com/n/projects/1234567/stories/153425732) Refactor testing strategy [(#33)](https://some-git-pr-url) [justneph](https://some-git-user-url)'
                    ]
                };

                Helpers.checkExtras(input).should.deep.equal(expected);
            });
        });
    });

    describe('formatChangelog()', () =>{
        const ogExtrasConfig = Hoek.clone(config.extraLabels);

        after(() =>{
            config.extraLabels = ogExtrasConfig;
        });

        it('replaces enhancement with default \'Features Implemented\'', () =>{
            const input = { enhancement: ['Some commit here']};
            const expected = { 'Features Implemented:': ['Some commit here']};
            Helpers.formatChangelog(input).should.deep.equal(expected);
        });

        describe('with extraLabels set', () =>{
            it('changes extra labels to use given copy', () => {
                config.extraLabels = {
                    chore: 'SOME CHORE'
                };
                const input = { chore: ['Some commit here']};
                const expected = { 'SOME CHORE': ['Some commit here']};
                Helpers.formatChangelog(input).should.deep.equal(expected);
            });

            it('overwrites the default enhancement text', () =>{
                config.extraLabels = {
                    enhancement: 'NEW FEATURE YO'
                };

                const input = { enhancement: ['Some commit here']};
                const expected = { 'NEW FEATURE YO': ['Some commit here']};
                Helpers.formatChangelog(input).should.deep.equal(expected);
            });
        });
    });

    describe('formatForMarkdown()', () =>{
        it('formats the log object to markdown', () => {
            const input = { 'Features Implemented:': ['Some commit']};
            const expected = '\n\n**Features Implemented:**\n* Some commit\n';

            Helpers.formatForMarkdown(input).should.deep.equal(expected);
        });
    });

    describe('setTags()', () =>{
        it('sets the tags if they\'re given in firstTag,lastTag format', () =>{
            const subject = Helpers.setTags(['123', '321']);

            subject.should.deep.equal({
                tag1: '123',
                tag2: '321'
            });
        });

        it('sets the tag2 to HEAD if it\'s not given', () =>{
            const subject = Helpers.setTags(['123']);

            subject.should.deep.equal({
                tag1: '123',
                tag2: 'HEAD'
            });
        });

        it.only('sets the tag1 to the current commit sha if it\'s not given', () =>{
            const ogGit = Hoek.clone(git);

            after(() =>{
                git = ogGit;
            });


            git.tag = function() {
                return 'SOME-SHA';
            };

            const subject = Helpers.setTags([]);

            subject.should.deep.equal({
                tag1: 'SOME-SHA',
                tag2: 'HEAD'
            });
        });
    });
});
