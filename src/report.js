const https = require("https");
const http = require("http");

/**
 * Fetches the oosmetrics report for a repo.
 * @param {string} apiUrl - Base API URL
 * @param {string} owner - Repo owner
 * @param {string} name - Repo name
 * @returns {Promise<object|null>} Report data or null if not found
 */
async function fetchReport(apiUrl, owner, name) {
  const url = `${apiUrl}/api/v1/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/report`;

  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "oosmetrics-health-check-action/1.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 404) {
            resolve(null);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`API returned ${res.statusCode}: ${data.slice(0, 200)}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse API response: ${e.message}`));
          }
        });
      })
      .on("error", reject);
  });
}

module.exports = { fetchReport };
