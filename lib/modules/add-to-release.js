'use strict';

module.exports = async function(changelog, releaseType) {
    const { tag2 } = this.tags;
    const [owner, repo] = this.config.github.repository.split('/');

    const release = await this.client.repos.getReleaseByTag({owner, repo, tag: tag2});
    const release_id = release.data.id;

    const releasePayload = {
        owner,
        repo,
        release_id,
        body      : changelog + 'TEST',
        prerelease: releaseType === 'pre'
    };

    await this.client.repos.editRelease(releasePayload);
    this.logger.color('green').bold().log(`RELEASE GENERATED FOR ${release.data.html_url}`);
};
