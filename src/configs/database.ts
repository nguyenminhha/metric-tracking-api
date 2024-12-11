import { MongoClient } from "mongodb";
import { serverConfigs } from "./server";

const client = new MongoClient(serverConfigs.DATABASE_URL);

client.connect();

const db = client.db("metrics");
export const collection = db.collection("metrics");
