const { Octokit } = require("@octokit/core");
const { token } = require("./config");


const owner = 'TrillerCo';
const repo = 'Triller';

const octokit = new Octokit({ auth: token });

const getReviews = async pullNumber => {
    const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
        owner: owner,
        repo: repo,
        pull_number: pullNumber
    });
    
    return response.data.map(item => item.user.login);
}

const getPRs = async () => {
    const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner: owner,
        repo: repo,
        state: 'all',
        per_page: '100' // maximum is 100
    });

    return response.data.map(pr => pr.number);
}

const reviewers = async () => {
    const prs = await getPRs();
    const asyncReviews = prs.map(number => getReviews(number));
    const reviews = await Promise.all(asyncReviews);

    var reviewers = [];
    reviews.forEach(review => reviewers = reviewers.concat(review) )

    const counts = {};
    reviewers.forEach(x => counts[x] = (counts[x] || 0) + 1);

    console.log(`Here are the reviewers for the last 100 PRs in ${owner}/${repo}:`)
    console.log(counts)

}

reviewers()