/**
 * Parses previous report values from a Markdown comment body.
 * @param {string} body - Markdown comment body
 * @returns {object|null}
 */
function parsePreviousReport(body) {
  if (!body) return null;

  try {
    const result = {};

    const growthMatch = body.match(/Growth \(7d\).*?\|\s*\+?([-\d.]+)\/day/);
    if (growthMatch) result.growth_rate_7d = parseFloat(growthMatch[1]);

    const accelMatch = body.match(/Acceleration.*?\|\s*\*\*\w+\*\*\s*\|\s*(\w+)/);
    if (accelMatch) result.acceleration = accelMatch[1];

    const origMatch = body.match(/Originality.*?\|\s*(\d+)\/100/);
    if (origMatch) result.originality = parseFloat(origMatch[1]);

    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

module.exports = { parsePreviousReport };
