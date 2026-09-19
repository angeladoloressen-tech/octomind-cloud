import { adaptGmail } from './gmail.mjs';
import { adaptJotform } from './jotform.mjs';
import { adaptGitHub } from './github.mjs';
import { adaptSiteAnalytics } from './site.mjs';

export function ingestSources(input = {}, options = {}) {
  const parts = [
    adaptGmail(input.gmail?.messages ?? [], { ownAddresses: options.ownAddresses ?? [] }),
    adaptJotform(input.jotform?.forms ?? [], { roleMap: options.jotformRoleMap ?? {} }),
    adaptGitHub(input.github?.repo ?? {}, {
      mergedPullRequests: input.github?.mergedPullRequests ?? 0,
      commits: input.github?.commits ?? 0,
    }),
    adaptSiteAnalytics(input.site ?? null),
  ];

  const events = parts.flatMap((x) => x.events ?? []);
  const diagnostics = parts.flatMap((x) => x.diagnostics ?? []);

  return {
    generatedAt: new Date().toISOString(),
    events,
    diagnostics,
  };
}
