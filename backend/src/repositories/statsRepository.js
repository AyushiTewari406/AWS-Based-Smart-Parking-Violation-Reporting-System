import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../services/dynamodb/client.js";

// NOTE: Select: "COUNT" still scans the whole table under the hood.
// This is acceptable for a low-traffic admin dashboard on a small
// student-project dataset, but would need a maintained counter
// (e.g. a DynamoDB atomic counter item updated on every write) at
// real-world scale. Documented here deliberately rather than hidden.
export async function countTableItems(tableName) {
  let count = 0;
  let ExclusiveStartKey;
  do {
    const result = await ddb.send(
      new ScanCommand({
        TableName: tableName,
        Select: "COUNT",
        ExclusiveStartKey,
      })
    );
    count += result.Count || 0;
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return count;
}
