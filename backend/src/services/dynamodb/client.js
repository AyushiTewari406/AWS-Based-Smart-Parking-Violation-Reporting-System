import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { config } from "../../config/env.js";

const rawClient = new DynamoDBClient({ region: config.region });

// removeUndefinedValues lets us build update payloads with optional fields
// left as `undefined` without the AWS SDK throwing an error.
export const ddb = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: { removeUndefinedValues: true },
});