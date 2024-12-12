import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";

import { schemaParam, validateParam } from "./validate-param";
import { ErrorMessage } from "@/constants";

const factory = createFactory();

export const createMetricsMiddleware = factory.createMiddleware(
  async (ctx, next) => {
    zValidator("json", schemaParam, validateParam);
    await next();
  }
);

export const getMetricsMiddleware = factory.createMiddleware(
  async (ctx, next) => {
    const userId = ctx.req.query("userId");
    const type = ctx.req.query("type");

    if (!userId || !type) {
      return ctx.json({ error: ErrorMessage.MetricsRequired }, 400);
    }

    await next();
  }
);

export const getMetricsForChartMiddleware = factory.createMiddleware(
  async (ctx, next) => {
    const userId = ctx.req.query("userId");
    const type = ctx.req.query("type");
    const period = ctx.req.query("period");

    if (!userId || !type || !period) {
      return ctx.json({ error: ErrorMessage.MetricsChartRequired }, 400);
    }

    await next();
  }
);
