import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../services/dynamodb/client.js";
import { config } from "../config/env.js";

const TABLE = config.tables.users;

export async function getUserById(userId) {
  const res = await ddb.send(new GetCommand({ TableName: TABLE, Key: { userId } }));
  return res.Item || null;
}

// Uses the EmailIndex GSI (we'll create this when we build the DynamoDB
// table in Phase 5) instead of scanning the whole table.
export async function getUserByEmail(email) {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
      Limit: 1,
    })
  );
  return res.Items?.[0] || null;
}

// ConditionExpression prevents two concurrent signups from both writing a
// user with the same generated userId (extremely unlikely with UUIDs, but
// it's the correct pattern — and it's free).
export async function createUser(user) {
  await ddb.send(
    new PutCommand({
      TableName: TABLE,
      Item: user,
      ConditionExpression: "attribute_not_exists(userId)",
    })
  );
  return user;
}