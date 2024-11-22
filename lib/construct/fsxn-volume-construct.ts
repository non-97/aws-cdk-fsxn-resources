import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { BaseConstructProps, BaseConstruct } from "./base-construct";
import { FsxnFileSystemProperty, FsxnVolumesProperty } from "../../parameter";

export interface FsxnVolumeConstructProps extends BaseConstructProps {
  fsxnFileSystemProperty: FsxnFileSystemProperty;
  fsxnVolumesProperty: FsxnVolumesProperty;
  backupSelectionName?: string;
}

export class FsxnVolumeConstruct extends BaseConstruct {
  public readonly fsvols: cdk.aws_fsx.CfnVolume[];

  constructor(scope: Construct, id: string, props: FsxnVolumeConstructProps) {
    super(scope, id, props);

    this.fsvols = props.fsxnVolumesProperty.volumes.map((volume) => {
      const fsvol = new cdk.aws_fsx.CfnVolume(
        this,
        this.toPascalCase(volume.name),
        {
          name: volume.name,
          ontapConfiguration: {
            storageVirtualMachineId:
              props.fsxnFileSystemProperty.storageVirtualMachineId,
            junctionPath: volume.junctionPath,
            securityStyle: volume.securityStyle,
            sizeInMegabytes: volume.sizeInMegabytes,
            snapshotPolicy: volume.snapshotPolicy,
            storageEfficiencyEnabled: volume.storageEfficiencyEnabled,
            tieringPolicy: volume.tieringPolicy,
          },
          volumeType: "ONTAP",
        }
      );

      if (props.systemProperty) {
        fsvol.name = this.generateResourceName("fsvol", volume.name, "_");
      }

      if (props.backupSelectionName) {
        cdk.Tags.of(fsvol).add("BackupSelection", props.backupSelectionName);
      }

      cdk.Tags.of(fsvol).add("Name", fsvol.name);

      return fsvol;
    });
  }
}
