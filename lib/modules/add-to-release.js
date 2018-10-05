'use strict';

module.exports = async function(changelog, releaseType) {
    const { tag2 } = this.tags;
    const [owner, repo] = this.config.github.repository.split('/');

    try {
        const release = await this.client.repos.getReleaseByTag({owner, repo, tag: tag2});
        const release_id = release.data.id;

        const releasePayload = {
            owner,
            repo,
            release_id,
            body      : changelog,
            prerelease: releaseType === 'pre'
        };

        return await this.client.repos.editRelease(releasePayload);
    } catch (error) {
        if (error.status === 'Not Found') {
            return await this.client.repos.createRelease({
                owner,
                repo,
                tag_name  : tag2,
                body      : changelog,
                prerelease: releaseType === 'pre'
            });
        }
    }
};
