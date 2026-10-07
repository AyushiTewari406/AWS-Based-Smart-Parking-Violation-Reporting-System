import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../services/dynamodb/client.js";
import { config } from "../config/env.js";

const TABLE = config.tables.violations;

export async function getViolationById(violationId) {
  const result = await ddb.send(
    new GetCommand({
      TableName: TABLE,
      Key: { violationId },
    })
  );
  return result.Item || null;
}

export async function getViolationsByVehicle(vehicleId) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "VehicleIndex",
      KeyConditionExpression: "vehicleId = :vehicleId",
      ExpressionAttributeValues: { ":vehicleId": vehicleId },
      ScanIndexForward: false,
    })
  );
  return result.Items || [];
}

export async function getViolationsByReporter(reportedBy) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "ReportedByIndex",
      KeyConditionExpression: "reportedBy = :reportedBy",
      ExpressionAttributeValues: { ":reportedBy": reportedBy },
      ScanIndexForward: false,
    })
  );
  return result.Items || [];
}

export async function getViolationsByStatus(status) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "StatusIndex",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
      ScanIndexForward: false,
    })
  );
  return result.Items || [];
}

export async function createViolation(violation) {
  await ddb.send(
    new PutCommand({
      TableName: TABLE,
      Item: violation,
      ConditionExpression: "attribute_not_exists(violationId)",
    })
  );
  return violation;
}

export async function updateViolation(violationId, updates) {
  const updateFields = Object.keys(updates);
  const expressionParts = [];
  const names = {};
  const values = {};

  for (const field of updateFields) {
    expressionParts.push(`#${field} = :${field}`);
    names[`#${field}`] = field;
    values[`:${field}`] = updates[field];
  }

  const result = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { violationId },
      UpdateExpression: `SET ${expressionParts.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes;
}

export async function deleteViolation(violationId) {
  await ddb.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { violationId },
    })
  );
}

// NOTE: this scans the whole table. It exists only for admin reporting
// endpoints (location-wise and monthly aggregate reports), which are
// low-frequency and run against a small student-project dataset. At real
// scale this would move to a proper aggregation pipeline instead.
export async function getAllViolations() {
  const items = [];
  let ExclusiveStartKey;
  do {
    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE,
        ExclusiveStartKey,
      })
    );
    items.push(...(result.Items || []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}
