import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { env } from "hono/adapter";

// config
import { collection, serverConfigs } from "@/configs";

// constants
import { ErrorMessage } from "@/constants";

// middlewares
import { schemaParam, validateParam } from "@/middlewares";

// utils
import {
  capitalizeFirstLetter,
  convertDistance,
  convertTemperature,
} from "@/util";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Welcome to Metrics Tracking API!");
});

app.post(
  "/metrics",
  zValidator("json", schemaParam, validateParam),
  async (c) => {
    const body = await c.req.json();
    await collection.insertOne(body);
    return c.json({ success: true });
  }
);

app.get("/metrics", async (c) => {
  const userId = c.req.query("userId");
  const type = c.req.query("type");
  const unit = c.req.query("unit");

  if (!userId || !type)
    return c.json({ error: ErrorMessage.MetricsRequired }, 400);

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

  return c.json(data);
});

app.get("/metrics/chart", async (c) => {
  const userId = c.req.query("userId");
  const type = c.req.query("type");
  const unit = c.req.query("unit");
  const period = c.req.query("period");

  if (!userId || !type || !period) {
    return c.json({ error: ErrorMessage.MetricsChartRequired }, 400);
  }

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

  return c.json(data.map((entry) => entry.latest));
});

// const port = 8788;
console.log(`Server is running on ${serverConfigs.HOST}:${serverConfigs.PORT}`);

serve({
  fetch: app.fetch,
  port: serverConfigs.PORT,
});
