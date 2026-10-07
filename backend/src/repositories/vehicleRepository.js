import { DeleteCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../services/dynamodb/client.js";
import { config } from "../config/env.js";

const TABLE = config.tables.vehicles;

export async function getVehicleById(vehicleId) {
  const res = await ddb.send(new GetCommand({ TableName: TABLE, Key: { vehicleId } }));
  return res.Item || null;
}

// Uses the VehicleNumberIndex GSI — "get vehicle using vehicle number"
// from your assignment's access pattern list.
export async function getVehicleByNumber(vehicleNumber) {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "VehicleNumberIndex",
      KeyConditionExpression: "vehicleNumber = :vn",
      ExpressionAttributeValues: { ":vn": vehicleNumber.toUpperCase() },
      Limit: 1,
    })
  );
  return res.Items?.[0] || null;
}

// Uses the UserIndex GSI — "get user's vehicles".
export async function getVehiclesByUser(userId) {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "UserIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    })
  );
  return res.Items || [];
}

export async function createVehicle(vehicle) {
  await ddb.send(
    new PutCommand({
      TableName: TABLE,
      Item: vehicle,
      ConditionExpression: "attribute_not_exists(vehicleId)",
    })
  );
  return vehicle;
}

export async function updateVehicle(vehicleId, updates) {
  const names = {};
  const values = {};
  const sets = [];
  for (const [key, value] of Object.entries(updates)) {
    names[`#${key}`] = key;
    values[`:${key}`] = value;
    sets.push(`#${key} = :${key}`);
  }
  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { vehicleId },
      UpdateExpression: `SET ${sets.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes;
}

export async function deleteVehicle(vehicleId) {
  await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { vehicleId } }));
}