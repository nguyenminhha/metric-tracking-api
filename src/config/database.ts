import { MongoClient } from "mongodb";
import { configs } from "./server";

const client = new MongoClient(configs.DATABASE_URL);

client.connect();

const db = client.db("metrics");
export const collection = db.collection("metrics");
