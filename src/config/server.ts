import dotenv from "dotenv";
import env from "env-var";

dotenv.config();

export const configs = {
  DATABASE_URL:
    env.get("DATABASE_URL").asString() || "mongodb://localhost:27017",
  HOST: env.get("HOST").asString() || "http://localhost",
  PORT: env.get("PORT").asInt() || 8788,
};
