import type { Config } from "@netlify/functions";

export default async () => {
  return Response.json({
    ok: true,
    mode: "netlify_cloud_only",
    service: "octomind-netlify-brain",
    claude: Boolean(Netlify.env.get("CLAUDE_KEY")),
    github: Boolean(Netlify.env.get("GITHUB_TOKEN") && Netlify.env.get("GITHUB_REPO")),
    supabase: Boolean(Netlify.env.get("SB_URL") && Netlify.env.get("SB_KEY")),
    timestamp: new Date().toISOString()
  });
};

export const config: Config = {
  path: "/status"
};
