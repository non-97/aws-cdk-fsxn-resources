import * as cdk from "aws-cdk-lib";
import { KmsKeyProperty } from "../types";

export const kmsKeyConfig: KmsKeyProperty = {
  alias: "fsxn",
  description: "for FSxN File system",
  enabled: true,
  enableKeyRotation: true,
  rotationPeriod: cdk.Duration.days(365),
};
