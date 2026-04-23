# oosmetrics Health Check

Weekly momentum report for your GitHub repo - growth rate, acceleration, originality grades, and category rankings.

[oosmetrics](https://oosmetrics.com) tracks 334,000+ public GitHub repos and computes daily growth, acceleration, and originality metrics. This Action posts a weekly summary as a comment on a pinned issue in your repo.

## Setup

Add this workflow to your repo at `.github/workflows/oosmetrics.yml`:

```yaml
name: oosmetrics Health Check
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday 9am UTC
  workflow_dispatch:       # Manual trigger for testing
permissions:
  issues: write
jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: oosmetrics/health-check-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

No API key needed. No configuration required.

## What you get

Every week, the Action posts a comment like this on a pinned issue:

| Metric | Grade | Value | Trend |
|---|---|---|---|
| Growth (7d) | **S** (top 0.3%) | +44.4/day | +12.1 |
| Acceleration | **S** | Surging | = |
| Originality | **S** | 100/100 | = |

Plus category rankings and a badge snippet you can add to your README.

## How it works

1. Fetches your repo's metrics from the oosmetrics public API
2. Compares with the previous week's report (from the last comment)
3. Posts the updated report as a comment on a pinned issue

The Action creates the issue automatically on first run. No setup needed.

## License

MIT
