import { createFactory } from "hono/factory";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";

// configs
import { collection } from "@/configs";

// middlewares
import {
  createMetricsMiddleware,
  getMetricsForChartMiddleware,
  getMetricsMiddleware,
} from "@/middlewares";

// utils
import {
  capitalizeFirstLetter,
  convertDistance,
  convertTemperature,
} from "@/util";

const factory = createFactory();

export const createMetricsHandler = factory.createHandlers(
  logger(),
  createMetricsMiddleware,
  async (ctx) => {
    const body = await ctx.req.json();
    await collection.insertOne(body);
    return ctx.json({ success: true });
  }
);

export const getMetricsHandler = factory.createHandlers(
  logger(),
  getMetricsMiddleware,
  async (ctx) => {
    const userId = ctx.req.query("userId");
    const type = ctx.req.query("type");
    const unit = ctx.req.query("unit");

    const data = await collection.find({ userId, type }).toArray();

    if (unit) {
      data.forEach((metric) => {
        if (type === "Distance") {
          metric.value = convertDistance(
            metric.value,
            metric.unit,
            capitalizeFirstLetter(unit)
          );
          metric.unit = unit;
        } else if (type === "Temperature") {
          metric.value = convertTemperature(
            metric.value,
            metric.unit,
            capitalizeFirstLetter(unit)
          );
          metric.unit = unit;
        }
      });
    }

    return ctx.json(data);
  }
);

export const getMetricsForChartHandler = factory.createHandlers(
  logger(),
  getMetricsForChartMiddleware,
  async (ctx) => {
    const userId = ctx.req.query("userId");
    const type = ctx.req.query("type");
    const unit = ctx.req.query("unit");
    const period = ctx.req.query("period") || "";

    const startDate = new Date();
    const months = parseInt(period[0]);
    startDate.setMonth(startDate.getMonth() - months);

    const pipeline = [
      { $match: { userId, type, date: { $gte: startDate.toISOString() } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } },
          },
          latest: { $last: "$$ROOT" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const data = await collection.aggregate(pipeline).toArray();

    console.log("data: ", data);

    if (unit) {
      data.forEach((entry) => {
        const metric = entry.latest;
        if (type === "Distance") {
          metric.value = convertDistance(metric.value, metric.unit, unit);
          metric.unit = unit;
        } else if (type === "Temperature") {
          metric.value = convertTemperature(metric.value, metric.unit, unit);
          metric.unit = unit;
        }
      });
    }

    return ctx.json(data.map((entry) => entry.latest));
  }
);
