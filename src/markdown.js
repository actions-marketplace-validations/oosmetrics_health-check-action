/**
 * Renders a report as a Markdown comment.
 * @param {object} report - Report data from the API
 * @param {object|null} previous - Previous report values for trend (null on first run)
 * @returns {string} Markdown string
 */
function renderMarkdown(report, previous) {
  const date = new Date().toISOString().split("T")[0];
  const lines = [];

  lines.push(`## oosmetrics Health Check - ${date}`);
  lines.push("");
  lines.push("### Grades");
  lines.push("");
  lines.push("| Metric | Grade | Value | Trend |");
  lines.push("|---|---|---|---|");

  const g = report.grades || {};

  if (g.growth_rate_7d) {
    const value = g.growth_rate_7d.value != null ? `+${g.growth_rate_7d.value.toFixed(1)}/day` : "--";
    const pct = g.growth_rate_7d.percentile != null ? ` (top ${g.growth_rate_7d.percentile.toFixed(1)}%)` : "";
    const trend = computeTrend(previous, "growth_rate_7d", g.growth_rate_7d.value);
    lines.push(`| Growth (7d) | **${g.growth_rate_7d.grade}**${pct} | ${value} | ${trend} |`);
  }

  if (g.acceleration) {
    const label = g.acceleration.label || "--";
    const trend = computeLabelTrend(previous, "acceleration", label);
    lines.push(`| Acceleration | **${g.acceleration.grade}** | ${label} | ${trend} |`);
  }

  if (g.originality) {
    const score = g.originality.score != null ? `${Math.round(g.originality.score)}/100` : "--";
    const pct = g.originality.percentile != null ? ` (top ${g.originality.percentile.toFixed(1)}%)` : "";
    const trend = computeTrend(previous, "originality", g.originality.score);
    lines.push(`| Originality | **${g.originality.grade}**${pct} | ${score} | ${trend} |`);
  }

  if (report.categories && report.categories.length > 0) {
    lines.push("");
    lines.push("### Category Rankings");
    lines.push("");
    for (const cat of report.categories) {
      lines.push(`- #${cat.rank} in ${cat.name} by ${cat.metric}`);
    }
  }

  if (report.badges && report.badges.length > 0) {
    lines.push("");
    lines.push("### Add a badge to your README");
    lines.push("");
    const badge = report.badges[0];
    lines.push(`[![oosmetrics](${badge.svg_url})](${report.page_url})`);
    lines.push("");
    lines.push("```");
    lines.push(badge.markdown);
    lines.push("```");
  }

  lines.push("");
  lines.push("---");
  lines.push(`*[View full metrics on oosmetrics](${report.page_url}) - The pulse of open-source*`);

  return lines.join("\n");
}

function computeTrend(previous, key, currentValue) {
  if (!previous || previous[key] == null || currentValue == null) return "--";
  const delta = currentValue - previous[key];
  if (Math.abs(delta) < 0.01) return "=";
  return delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
}

function computeLabelTrend(previous, key, currentLabel) {
  if (!previous || !previous[key]) return "--";
  return previous[key] === currentLabel ? "=" : currentLabel;
}

module.exports = { renderMarkdown };
