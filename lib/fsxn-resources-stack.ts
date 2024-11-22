import * as cdk from "aws-cdk-lib";
import { Construct, IConstruct } from "constructs";
import { FsxnResourcesProperty } from "../parameter";
import { PlConstruct } from "./construct/pl-construct";
import { KmsConstruct } from "./construct/kms-construct";
import { SecurityGroupConstruct } from "./construct/securitygroup-construct";
import { BackupConstruct } from "./construct/backup-construct";
import { FsxnVolumeConstruct } from "./construct/fsxn-volume-construct";
import { MonitoringConstruct } from "./construct/monitoring-construct";

export interface FsxnResourcesStackProps
  extends cdk.StackProps,
    FsxnResourcesProperty {}

export class FsxnResourcesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FsxnResourcesStackProps) {
    super(scope, id, props);

    // Prefix List
    if (props.prefixListsProperty) {
      new PlConstruct(this, "PlConstruct", {
        systemProperty: props.systemProperty,
        prefixListsProperty: props.prefixListsProperty,
      });
    }

    // KMS Key
    if (props.kmsKeyProperty) {
      new KmsConstruct(this, "KmsConstruct", {
        systemProperty: props.systemProperty,
        kmsKeyProperty: props.kmsKeyProperty,
      });
    }

    // Security Group
    if (props.securityGroupProperty) {
      new SecurityGroupConstruct(this, "SecurityGroupConstruct", {
        systemProperty: props.systemProperty,
        securityGroupProperty: props.securityGroupProperty,
      });
    }

    // AWS Backup
    const backupConstruct = props.backupProperty
      ? new BackupConstruct(this, "BackupConstruct", {
          systemProperty: props.systemProperty,
          backupProperty: props.backupProperty,
        })
      : undefined;

    // FSxN Volume
    const fsxnVolumeConstruct =
      props.fsxnVolumesProperty && props.fsxnFileSystemProperty
        ? new FsxnVolumeConstruct(this, "FsxnVolumeConstruct", {
            systemProperty: props.systemProperty,
            fsxnFileSystemProperty: props.fsxnFileSystemProperty,
            fsxnVolumesProperty: props.fsxnVolumesProperty,
            backupSelectionName: backupConstruct?.backupSelectionName,
          })
        : undefined;

    props.monitoringProperty && props.fsxnFileSystemProperty
      ? new MonitoringConstruct(this, "MonitoringConstruct", {
          systemProperty: props.systemProperty,
          fsxnFileSystemProperty: props.fsxnFileSystemProperty,
          monitoringProperty: props.monitoringProperty,
          fsvols: fsxnVolumeConstruct?.fsvols,
          backupVault: backupConstruct?.backupVault,
        })
      : undefined;
  }
}
