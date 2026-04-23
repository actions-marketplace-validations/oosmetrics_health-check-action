const ISSUE_TITLE = "oosmetrics Health Check";

/**
 * Finds the existing health check issue, or creates one.
 * @returns {Promise<number>} Issue number
 */
async function findOrCreateIssue(octokit, owner, repo) {
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "all",
    per_page: 100,
  });

  const existing = issues.find((i) => i.title === ISSUE_TITLE);

  if (existing) {
    if (existing.state === "closed") {
      try {
        await octokit.rest.issues.update({ owner, repo, issue_number: existing.number, state: "open" });
      } catch {
        return createIssue(octokit, owner, repo);
      }
    }
    return existing.number;
  }

  return createIssue(octokit, owner, repo);
}

async function createIssue(octokit, owner, repo) {
  const { data: issue } = await octokit.rest.issues.create({
    owner,
    repo,
    title: ISSUE_TITLE,
    body: "Weekly momentum report from [oosmetrics](https://oosmetrics.com). This issue is updated automatically by the oosmetrics Health Check Action.",
  });

  try {
    await octokit.graphql(
      `mutation($issueId: ID!) { pinIssue(input: {issueId: $issueId}) { issue { id } } }`,
      { issueId: issue.node_id }
    );
  } catch {
    // Pinning failed (no admin permission) - continue.
  }

  return issue.number;
}

/**
 * Gets the body of the most recent bot comment on the issue.
 * @returns {Promise<string|null>}
 */
async function getPreviousCommentBody(octokit, owner, repo, issueNumber) {
  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  });

  const botComments = comments.filter(
    (c) => c.user && c.user.login === "github-actions[bot]" && c.body && c.body.includes("oosmetrics Health Check")
  );

  return botComments.length > 0 ? botComments[botComments.length - 1].body : null;
}

module.exports = { findOrCreateIssue, getPreviousCommentBody };
