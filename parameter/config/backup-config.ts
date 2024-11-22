import * as cdk from "aws-cdk-lib";
import { BackupProperty } from "../types";

export const backupConfig: BackupProperty = {
  backupVault: {
    name: "fsxn",
    encryptionKeyAlias: "fsxn",
    blockRecoveryPointDeletion: true,
    lockConfiguration: {
      minRetention: cdk.Duration.days(7),
      maxRetention: cdk.Duration.days(90),
      changeableFor: cdk.Duration.days(90),
    },
  },
  backupPlanRule: {
    ruleName: "fsxn",
    startWindow: cdk.Duration.hours(1),
    completionWindow: cdk.Duration.hours(12),
    deleteAfter: cdk.Duration.days(7),
    scheduleExpression: cdk.aws_events.Schedule.cron({
      minute: "40",
      hour: "8",
    }),
  },
  selectionName: "fsxn",
  planName: "fsxn",
};
