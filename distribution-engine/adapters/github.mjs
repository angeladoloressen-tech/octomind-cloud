function count(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function adaptGitHub(repo = {}, { mergedPullRequests = 0, commits = 0 } = {}) {
  const events = [];
  const diagnostics = [];

  const stars = count(repo.stargazers_count ?? repo.stars);
  const watchers = count(repo.subscribers_count ?? repo.watchers_count ?? repo.watchers);
  const forks = count(repo.forks_count ?? repo.forks);

  if (stars) events.push({ source: 'github', type: 'github_star', count: stars, snapshot: true });
  if (watchers) events.push({ source: 'github', type: 'github_watch', count: watchers, snapshot: true });
  if (forks) events.push({ source: 'github', type: 'github_fork', count: forks, snapshot: true });

  // Commits and merged PRs measure our own execution, not audience demand.
  if (commits) events.push({ source: 'github', type: 'commit', count: count(commits), activity: true });
  if (mergedPullRequests) events.push({ source: 'github', type: 'merged_pr', count: count(mergedPullRequests), activity: true });

  diagnostics.push({
    source: 'github',
    status: 'ok',
    public: repo.private === false,
    stars,
    watchers,
    forks,
  });

  return { events, diagnostics };
}
