import { App } from "aws-cdk-lib";
import { SmartParkingStack } from "./smart-parking-stack.js";

const app = new App();
new SmartParkingStack(app, "SmartParkingViolationStack", {
  env: {
    region: process.env.AWS_REGION || "ap-south-1",
  },
});
