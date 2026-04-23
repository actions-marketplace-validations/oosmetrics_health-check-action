const core = require("@actions/core");
const github = require("@actions/github");
const { fetchReport } = require("./report");
const { renderMarkdown } = require("./markdown");
const { parsePreviousReport } = require("./trend");
const { findOrCreateIssue, getPreviousCommentBody } = require("./issue");

async function run() {
  try {
    const apiUrl = core.getInput("api-url") || "https://api.oosmetrics.com";
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      core.setFailed("GITHUB_TOKEN is required. Add `permissions: issues: write` to your workflow.");
      return;
    }

    const { owner, repo } = github.context.repo;
    core.info(`Fetching oosmetrics report for ${owner}/${repo}...`);

    const report = await fetchReport(apiUrl, owner, repo);

    if (!report) {
      core.warning(`${owner}/${repo} is not yet tracked by oosmetrics. It will be picked up automatically within 24 hours.`);
      return;
    }

    if (!report.grades || Object.keys(report.grades).length === 0) {
      core.warning("Repo found but metrics are still being computed. Check back next week.");
      return;
    }

    const octokit = github.getOctokit(token);
    const issueNumber = await findOrCreateIssue(octokit, owner, repo);

    const previousBody = await getPreviousCommentBody(octokit, owner, repo, issueNumber);
    const previous = parsePreviousReport(previousBody);

    const markdown = renderMarkdown(report, previous);

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: markdown,
    });

    core.info(`Report posted on issue #${issueNumber}`);
    core.setOutput("issue-number", issueNumber);
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
