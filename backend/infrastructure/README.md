# Infrastructure (AWS CDK, JavaScript)

This folder deploys the serverless backend: 21 Lambda functions and a REST
API Gateway in front of them. It does **not** create the DynamoDB tables or
the S3 bucket — those already exist and are only referenced here:

| Resource | Name | Created by |
|---|---|---|
| DynamoDB table | ParkingUsers | teammate, manually |
| DynamoDB table | ParkingVehicles | teammate, manually |
| DynamoDB table | ParkingViolations | teammate, manually |
| S3 bucket | smart-parking-evidence-vit-2026-xxxxx | teammate, manually |

## What `cdk deploy` WILL create
- 21 AWS Lambda functions (Node.js 20.x), one per API route
- 1 API Gateway REST API with matching routes and CORS enabled
- 1 IAM execution role per Lambda function, each granted only the
  DynamoDB/S3 permissions that specific function needs (least privilege —
  see `routes.js` for the exact access list per function)
- CloudWatch Log Groups (created automatically by Lambda for each function)

No existing resource is modified or deleted by this stack.

## Before you deploy
1. Make sure the AWS CLI is configured on your machine with your own IAM
   user credentials (never the root account) — `aws configure` or
   equivalent, already set up outside this project.
2. Set the JWT signing secret as an environment variable (never commit it):
   - PowerShell: `$env:JWT_SECRET = "<a long random string>"`
3. From the `backend/` folder: `npm install` (installs `aws-cdk-lib` and
   `constructs`, added to package.json devDependencies).
4. First time only in this AWS account/region: `npx cdk bootstrap`.
5. Review what will change: `npx cdk diff`.
6. Deploy: `npx cdk deploy`.

## Confirm before running `cdk deploy`
Per this project's AWS safety rules, deploying is a real-resource-creating
action and should not happen silently. Read the "What `cdk deploy` WILL
create" list above, confirm you're fine with it, and only then run the
command yourself (or ask Claude to run it with you watching).
