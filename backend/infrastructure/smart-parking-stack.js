import { Stack, Duration, CfnOutput } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { routes } from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.join(__dirname, "..");

// These AWS resources already exist (created manually ahead of this
// project's CDK setup) — the stack references them, it never creates or
// modifies them. See infrastructure/README.md for the exact names.
const EXISTING_RESOURCES = {
  usersTable: "ParkingUsers",
  vehiclesTable: "ParkingVehicles",
  violationsTable: "ParkingViolations",
  evidenceBucket: "smart-parking-evidence-vit-2026-xxxxx",
};

export class SmartParkingStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const usersTable = dynamodb.Table.fromTableName(this, "UsersTable", EXISTING_RESOURCES.usersTable);
    const vehiclesTable = dynamodb.Table.fromTableName(this, "VehiclesTable", EXISTING_RESOURCES.vehiclesTable);
    const violationsTable = dynamodb.Table.fromTableName(this, "ViolationsTable", EXISTING_RESOURCES.violationsTable);
    const evidenceBucket = s3.Bucket.fromBucketName(this, "EvidenceBucket", EXISTING_RESOURCES.evidenceBucket);

    const sharedCode = lambda.Code.fromAsset(BACKEND_ROOT, {
      exclude: ["infrastructure", "tests", "node_modules/jest", "node_modules/.bin", ".git", "cdk.out"],
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET environment variable is not set. Export it in your shell before running " +
        "'cdk deploy' — never hardcode it in source. Example (PowerShell): $env:JWT_SECRET = \"<a long random string>\""
      );
    }

    const api = new apigateway.RestApi(this, "SmartParkingApi", {
      restApiName: "smart-parking-violation-api",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    for (const route of routes) {
      const fn = new lambda.Function(this, route.name, {
        functionName: `smart-parking-${route.name}`.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: `${route.file.replace(/\.js$/, "")}.handler`,
        code: sharedCode,
        timeout: Duration.seconds(10),
        memorySize: 256,
        environment: {
          AWS_REGION_OVERRIDE: this.region,
          USERS_TABLE: EXISTING_RESOURCES.usersTable,
          VEHICLES_TABLE: EXISTING_RESOURCES.vehiclesTable,
          VIOLATIONS_TABLE: EXISTING_RESOURCES.violationsTable,
          EVIDENCE_BUCKET: EXISTING_RESOURCES.evidenceBucket,
          EVIDENCE_PREFIX: "evidence/",
          JWT_SECRET: jwtSecret,
          JWT_EXPIRY: "12h",
          REPEAT_VIOLATION_WINDOW_DAYS: "90",
          REPEAT_VIOLATION_THRESHOLD: "2",
        },
      });

      // Least-privilege grants: a function only gets access to the
      // specific table(s)/bucket it actually touches, nothing blanket.
      if (route.access.users === "read") usersTable.grantReadData(fn);
      if (route.access.users === "readwrite") usersTable.grantReadWriteData(fn);
      if (route.access.vehicles === "read") vehiclesTable.grantReadData(fn);
      if (route.access.vehicles === "readwrite") vehiclesTable.grantReadWriteData(fn);
      if (route.access.violations === "read") violationsTable.grantReadData(fn);
      if (route.access.violations === "readwrite") violationsTable.grantReadWriteData(fn);
      if (route.access.s3 === "get") evidenceBucket.grantRead(fn);
      if (route.access.s3 === "put") evidenceBucket.grantPut(fn);

      const segments = route.path.split("/").filter(Boolean);
      let resource = api.root;
      for (const segment of segments) {
        resource = resource.getResource(segment) || resource.addResource(segment);
      }
      resource.addMethod(route.method, new apigateway.LambdaIntegration(fn));
    }

    new CfnOutput(this, "ApiUrl", { value: api.url });
  }
}
