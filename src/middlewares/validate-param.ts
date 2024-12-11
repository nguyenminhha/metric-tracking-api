import { z } from "zod";

// Constants
import { TemperatureUnit, DistanceUnit, ErrorMessage } from "@/constants";

export const schemaParam = z.object({
  userId: z.string(),
  type: z.enum(["Distance", "Temperature"]),
  value: z.number(),
  unit: z.enum([...TemperatureUnit, ...DistanceUnit]),
  date: z.string().date(ErrorMessage.Date),
});

export const validateParam = async (result: any, c: any) => {
  const { success, data } = result;
  const { type, unit } = data;

  if (!success) {
    return c.text(result.error.errors[0].message, 400);
  }

  try {
    if (type === "Distance") {
      const validateUnit = z.enum(DistanceUnit);
      await validateUnit.parseAsync(unit);
    } else {
      await z.enum(TemperatureUnit).parse(unit);
    }
  } catch (error: any) {
    return c.text(error.errors[0].message, 400);
  }
};
