import type { Config } from "@netlify/functions";

export default async () => {
  return Response.json({
    ok: true,
    service: "octomind-netlify-brain",
    endpoint: "health",
    timestamp: new Date().toISOString()
  });
};

export const config: Config = {
  path: "/health"
};
