'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, after, expect } = lab;
const Hoek = require('hoek');
const Promise = require('bluebird');
const Helpers = require('../lib/modules/helpers');
const config = require('../.origami-logs-config-template');
assertions.should();

describe('Helpers', () => {
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
        },
        config: config
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

            Helpers.checkAliasLabels.call(context, inputLabel).should.equal(expectedLabel);
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

                Helpers.checkExtras.call(context, input).should.deep.equal(expected);
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
            Helpers.formatChangelog.call(context, input).should.deep.equal(expected);
        });

        it('replaces bug with default \'Bugs Fixed\'', () =>{
            const input = { bug: ['Some commit here']};
            const expected = { 'Bugs Fixed:': ['Some commit here']};
            Helpers.formatChangelog.call(context, input).should.deep.equal(expected);
        });


        describe('with extraLabels set', () =>{
            it('changes extra labels to use given copy', () => {
                config.extraLabels = {
                    chore: 'SOME CHORE'
                };
                const input = { chore: ['Some commit here']};
                const expected = { 'SOME CHORE': ['Some commit here']};
                Helpers.formatChangelog.call(context, input).should.deep.equal(expected);
            });

            it('overwrites the default enhancement text', () =>{
                config.extraLabels = {
                    enhancement: 'NEW FEATURE YO'
                };

                const input = { enhancement: ['Some commit here']};
                const expected = { 'NEW FEATURE YO': ['Some commit here']};
                Helpers.formatChangelog.call(context, input).should.deep.equal(expected);
            });
        });
    });

    describe('formatForMarkdown()', () =>{
        it('formats the log object to markdown', () => {
            const input = { 'Features Implemented:': ['Some commit']};
            const expected = '\n\n**Features Implemented:**\n* Some commit\n';

            Helpers.formatForMarkdown.call(context, input).should.deep.equal(expected);
        });
    });

    describe('setTags()', () =>{
        it('sets the tags if they\'re given in firstTag,lastTag format', () =>{
            const subject = Helpers.setTags.call(context, ['123', '321']);

            subject.should.deep.equal({
                tag1: '123',
                tag2: '321'
            });
        });

        it('throws an error if no tags are given', () =>{
            const subject = function() {
                Helpers.setTags.call(context, undefined);
            };

            expect(subject).to.throw();
        });
    });
});
