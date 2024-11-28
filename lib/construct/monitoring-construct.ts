import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { BaseConstructProps, BaseConstruct } from "./base-construct";
import {
  FsxnFileSystemProperty,
  MonitoringProperty,
  SystemProperty,
} from "../../parameter";
import { BackupVault } from "aws-cdk-lib/aws-backup";

export interface MonitoringConstructProps extends BaseConstructProps {
  fsxnFileSystemProperty: FsxnFileSystemProperty;
  monitoringProperty: MonitoringProperty;
  fsvols?: cdk.aws_fsx.CfnVolume[];
  backupVault?: cdk.aws_backup.IBackupVault;
}

export class MonitoringConstruct extends BaseConstruct {
  private readonly topic: cdk.aws_sns.Topic;
  private readonly filesystemId: string;
  private readonly systemProperty?: SystemProperty;
  private readonly enableOkAction?: boolean;

  constructor(scope: Construct, id: string, props: MonitoringConstructProps) {
    super(scope, id, props);

    // SNS Topic
    const topic = new cdk.aws_sns.Topic(this, "Topic", {
      topicName: props.monitoringProperty.topicName,
    });
    this.topic = topic;

    props.monitoringProperty.emailAddresses?.forEach((emailAddress) => {
      topic.addSubscription(
        new cdk.aws_sns_subscriptions.EmailSubscription(emailAddress)
      );
    });

    this.filesystemId = props.fsxnFileSystemProperty.fileSystemId;
    this.systemProperty = props.systemProperty;
    this.enableOkAction = props.monitoringProperty.enableOkAction;
    const rootVolumeName = "fsvol-root";
    const fsvolIdNames = props.fsvols?.map((fsvol) => {
      const name = (
        this.systemProperty
          ? fsvol.name.substring(
              fsvol.name.indexOf(`${this.systemProperty.envName}_`) +
                this.systemProperty.envName.length +
                1
            )
          : fsvol.name
      ).replace(/_/g, "-");
      return { id: fsvol.attrVolumeId, name };
    });

    // AWS CDK管理外のボリュームを監視対象とする場合
    if (props.monitoringProperty.addFsvolIdNames) {
      fsvolIdNames?.push(...props.monitoringProperty.addFsvolIdNames);
    }

    // ルートボリュームを監視対象とする場合
    if (props.monitoringProperty.rootVolumeId) {
      fsvolIdNames?.push({
        id: props.monitoringProperty.rootVolumeId,
        name: rootVolumeName,
      });
    }

    // FSxN Filesystem Alarm
    this.alarmFileSystemStorageUsedPercent();
    this.alarmFileSystemNetworkThroughputUtilization();
    this.alarmFileSystemFileServerDiskThroughputUtilization();
    this.alarmFileSystemDiskIopsUtilization();
    this.alarmFileSystemCPUUtilization();

    // FSxN Volume Alarm
    fsvolIdNames?.forEach((fsvolIdName) => {
      this.alarmVolumeStorageCapacityUtilization(
        fsvolIdName.id,
        fsvolIdName.name
      );

      // enableInodeUsageMonitoring が false または rootボリュームについてはinode監視を行わない
      if (
        !props.monitoringProperty.enableInodeUsageMonitoring ||
        fsvolIdName.name === rootVolumeName
      ) {
        return;
      }

      this.alarmVolumeInodeUtilization(fsvolIdName.id, fsvolIdName.name);
    });

    // AWS Backup Alarm
    if (props.backupVault) {
      this.alarmNumberOfBackupJobsFailed(props.backupVault);
    }
  }

  // SSD物理使用率の監視
  private alarmFileSystemStorageUsedPercent(): void {
    const metricName = "StorageCapacityUtilization";
    const alarmUniqueName = `fsxn-FileSystem-${metricName}`;
    const dimensionsMap = {
      FileSystemId: this.filesystemId,
      StorageTier: "SSD",
      DataType: "All",
    };
    const threshold = 80;
    const evaluationPeriods = 60;

    this.createAlarm(
      metricName,
      alarmUniqueName,
      dimensionsMap,
      threshold,
      evaluationPeriods
    );
  }

  // ネットワークスループット使用率の監視
  private alarmFileSystemNetworkThroughputUtilization(): void {
    const metricName = "NetworkThroughputUtilization";
    const alarmUniqueName = `fsxn-FileSystem-${metricName}`;
    const dimensionsMap = {
      FileSystemId: this.filesystemId,
    };
    const threshold = 80;
    const evaluationPeriods = 60;

    this.createAlarm(
      metricName,
      alarmUniqueName,
      dimensionsMap,
      threshold,
      evaluationPeriods
    );
  }

  // ファイルサーバーベースのディスクスループット使用率の監視
  private alarmFileSystemFileServerDiskThroughputUtilization(): void {
    const metricName = "FileServerDiskThroughputUtilization";
    const alarmUniqueName = `fsxn-FileSystem-${metricName}`;
    const dimensionsMap = {
      FileSystemId: this.filesystemId,
    };
    const threshold = 80;
    const evaluationPeriods = 60;

    this.createAlarm(
      metricName,
      alarmUniqueName,
      dimensionsMap,
      threshold,
      evaluationPeriods
    );
  }

  // ディスクIOPSの使用率の監視
  private alarmFileSystemDiskIopsUtilization(): void {
    const metricName = "DiskIopsUtilization";
    const alarmUniqueName = `fsxn-FileSystem-${metricName}`;
    const dimensionsMap = {
      FileSystemId: this.filesystemId,
    };
    const threshold = 80;
    const evaluationPeriods = 60;

    this.createAlarm(
      metricName,
      alarmUniqueName,
      dimensionsMap,
      threshold,
      evaluationPeriods
    );
  }

  // CPU使用率の監視
  private alarmFileSystemCPUUtilization(): void {
    const metricName = "CPUUtilization";
    const alarmUniqueName = `fsxn-FileSystem-${metricName}`;
    const dimensionsMap = {
      FileSystemId: this.filesystemId,
    };
    const threshold = 80;
    const evaluationPeriods = 60;

    this.createAlarm(
      metricName,
      alarmUniqueName,
      dimensionsMap,
      threshold,
      evaluationPeriods
    );
  }

  // ボリューム使用率の監視
  private alarmVolumeStorageCapacityUtilization(
    volumeId: string,
    volumeName: string
  ): void {
    const metricName = "StorageCapacityUtilization";
    const alarmUniqueName = `${volumeName}-${metricName}`;
    const dimensionsMap = {
      FileSystemId: this.filesystemId,
      VolumeId: volumeId,
    };
    const threshold = 80;
    const evaluationPeriods = 60;

    this.createAlarm(
      metricName,
      alarmUniqueName,
      dimensionsMap,
      threshold,
      evaluationPeriods
    );
  }

  // ボリュームのinode使用率の監視
  private alarmVolumeInodeUtilization(
    volumeId: string,
    volumeName: string
  ): void {
    const metricName = "inodeUtilization";
    const alarmUniqueName = `${volumeName}-${metricName}`;
    const threshold = 80;
    const evaluationPeriods = 60;

    const alarmName = this.systemProperty
      ? this.generateResourceName("cw-alarm", alarmUniqueName)
      : alarmUniqueName;

    const alarm = new cdk.aws_cloudwatch.Alarm(
      this,
      `Alarm${this.toPascalCase(alarmUniqueName)}`,
      {
        metric: new cdk.aws_cloudwatch.MathExpression({
          label: "inodeUtilization",
          expression: "filesUsed / filesCapacity * 100",
          usingMetrics: {
            filesCapacity: new cdk.aws_cloudwatch.Metric({
              namespace: "AWS/FSx",
              metricName: "FilesCapacity",
              dimensionsMap: {
                FileSystemId: this.filesystemId,
                VolumeId: volumeId,
              },
              period: cdk.Duration.seconds(60),
              statistic: "Maximum",
            }),
            filesUsed: new cdk.aws_cloudwatch.Metric({
              namespace: "AWS/FSx",
              metricName: "FilesUsed",
              dimensionsMap: {
                FileSystemId: this.filesystemId,
                VolumeId: volumeId,
              },
              period: cdk.Duration.seconds(60),
              statistic: "Maximum",
            }),
          },
          period: cdk.Duration.seconds(60),
        }),
        threshold,
        evaluationPeriods,
        comparisonOperator:
          cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        alarmName,
        treatMissingData: cdk.aws_cloudwatch.TreatMissingData.MISSING,
      }
    );

    cdk.Tags.of(alarm).add("Name", alarmName);

    alarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.topic));

    if (this.enableOkAction) {
      alarm.addOkAction(new cdk.aws_cloudwatch_actions.SnsAction(this.topic));
    }
  }

  // AWS Backupのバックアップステータス監視
  private alarmNumberOfBackupJobsFailed(
    backupVault: cdk.aws_backup.IBackupVault
  ): void {
    const metricName = "NumberOfBackupJobsFailed";
    const alarmUniqueName = `fsxn-${metricName}`;
    const threshold = 0;
    const evaluationPeriods = 1;

    const alarmName = this.systemProperty
      ? this.generateResourceName("cw-alarm", alarmUniqueName)
      : alarmUniqueName;

    const alarm = new cdk.aws_cloudwatch.Alarm(
      this,
      `Alarm${this.toPascalCase(alarmUniqueName)}`,
      {
        metric: new cdk.aws_cloudwatch.Metric({
          namespace: "AWS/Backup",
          metricName,
          dimensionsMap: {
            BackupVaultName: backupVault.backupVaultName,
          },
          period: cdk.Duration.seconds(60),
          statistic: "Sum",
        }),
        threshold,
        evaluationPeriods,
        comparisonOperator:
          cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        alarmName,
        treatMissingData: cdk.aws_cloudwatch.TreatMissingData.MISSING,
      }
    );

    cdk.Tags.of(alarm).add("Name", alarmName);

    alarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.topic));
  }

  // FSxN CloudWatch Alarmの作成
  private createAlarm(
    metricName: string,
    alarmUniqueName: string,
    dimensionsMap: cdk.aws_cloudwatch.DimensionsMap,
    threshold: number,
    evaluationPeriods: number
  ): void {
    const alarmName = this.systemProperty
      ? this.generateResourceName("cw-alarm", alarmUniqueName)
      : alarmUniqueName;

    const alarm = new cdk.aws_cloudwatch.Alarm(
      this,
      `Alarm${this.toPascalCase(alarmUniqueName)}`,
      {
        metric: new cdk.aws_cloudwatch.Metric({
          namespace: "AWS/FSx",
          metricName,
          dimensionsMap,
          period: cdk.Duration.seconds(60),
          statistic: "Maximum",
        }),
        threshold,
        evaluationPeriods,
        comparisonOperator:
          cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        alarmName,
        treatMissingData: cdk.aws_cloudwatch.TreatMissingData.MISSING,
      }
    );

    cdk.Tags.of(alarm).add("Name", alarmName);

    alarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.topic));

    if (this.enableOkAction) {
      alarm.addOkAction(new cdk.aws_cloudwatch_actions.SnsAction(this.topic));
    }
  }
}
