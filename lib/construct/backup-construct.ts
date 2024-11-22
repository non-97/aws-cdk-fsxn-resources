import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { BaseConstructProps, BaseConstruct } from "./base-construct";
import { BackupProperty } from "../../parameter";

export interface BackupConstructProps extends BaseConstructProps {
  backupProperty: BackupProperty;
}

export class BackupConstruct extends BaseConstruct {
  public readonly backupSelectionName: string;
  public readonly backupVault: cdk.aws_backup.IBackupVault;

  constructor(scope: Construct, id: string, props: BackupConstructProps) {
    super(scope, id, props);

    // Backup Vault
    const alias =
      props.backupProperty.backupVault.encryptionKeyAlias &&
      props.systemProperty
        ? this.generateResourceName(
            "key",
            props.backupProperty.backupVault.encryptionKeyAlias
          )
        : props.backupProperty.backupVault.encryptionKeyAlias;

    const backupVaultName = props.systemProperty
      ? this.generateResourceName(
          "backup-vault",
          props.backupProperty.backupVault.name
        )
      : props.backupProperty.backupVault.name;

    const backupVault = new cdk.aws_backup.BackupVault(this, "Vault", {
      backupVaultName,
      encryptionKey: alias
        ? cdk.aws_kms.Key.fromLookup(this, "Key", {
            aliasName: `alias/${alias}`,
          })
        : undefined,
      blockRecoveryPointDeletion:
        props.backupProperty.backupVault.blockRecoveryPointDeletion,
      lockConfiguration: props.backupProperty.backupVault.lockConfiguration,
    });
    this.backupVault = backupVault;
    if (backupVaultName) {
      cdk.Tags.of(backupVault).add("Name", backupVaultName);
    }

    // Backup Plan Rule
    const backupPlanRule = new cdk.aws_backup.BackupPlanRule({
      ...props.backupProperty.backupPlanRule,
      backupVault: backupVault,
      ruleName: props.systemProperty
        ? this.generateResourceName(
            "backup-rule",
            props.backupProperty.backupPlanRule.ruleName
          )
        : props.backupProperty.backupPlanRule.ruleName,
    });

    // Backup Plan
    const backupPlanName = props.systemProperty
      ? this.generateResourceName("backup-plan", props.backupProperty.planName)
      : props.backupProperty.planName;

    const backupPlan = new cdk.aws_backup.BackupPlan(this, "BackupPlan", {
      backupPlanName,
      backupPlanRules: [backupPlanRule],
    });
    if (backupPlanName) {
      cdk.Tags.of(backupPlan).add("Name", backupPlanName);
    }

    // Backup Selection
    const backupSelectionName = props.systemProperty
      ? this.generateResourceName(
          "backup-selection",
          props.backupProperty.selectionName
        )
      : props.backupProperty.selectionName;

    const backupSelection = new cdk.aws_backup.BackupSelection(
      this,
      "BackupSelection",
      {
        backupPlan,
        resources: [cdk.aws_backup.BackupResource.fromArn("arn:*:fsx:*")],
        backupSelectionName,
        role: cdk.aws_iam.Role.fromRoleArn(
          this,
          "Role",
          `arn:aws:iam::${
            cdk.Stack.of(this).account
          }:role/service-role/AWSBackupDefaultServiceRole`
        ),
      }
    );
    this.backupSelectionName = backupSelectionName;

    const cfnBackupSelection = backupSelection.node
      .defaultChild as cdk.aws_backup.CfnBackupSelection;
    cfnBackupSelection.addPropertyOverride("BackupSelection.Conditions", {
      StringEquals: [
        {
          ConditionKey: "aws:ResourceTag/BackupSelection",
          ConditionValue: backupSelectionName,
        },
      ],
    });
  }
}
