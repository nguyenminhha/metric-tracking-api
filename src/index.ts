import { serve } from "@hono/node-server";
import { Hono, Next } from "hono";
import { cors } from "hono/cors";

// configs
import { serverConfigs } from "@/configs";

// controllers
import {
  createMetricsHandler,
  getMetricsForChartHandler,
  getMetricsHandler,
} from "@/controllers";

const app = new Hono();

app.use("*", async (ctx, next: Next) => {
  const corsMiddleware = cors({
    origin: "*",
    allowHeaders: ["Cache-Control", "Content-Type", "Authorization"],
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
  });
  return corsMiddleware(ctx, next);
});

app.get("/", (c) => {
  return c.text("Welcome to Metrics Tracking API!");
});

app.post("/metrics", ...createMetricsHandler);

app.get("/metrics", ...getMetricsHandler);

app.get("/metrics/chart", ...getMetricsForChartHandler);

// const port = 8788;
console.log(`Server is running on ${serverConfigs.HOST}:${serverConfigs.PORT}`);

serve({
  fetch: app.fetch,
  port: serverConfigs.PORT,
});
