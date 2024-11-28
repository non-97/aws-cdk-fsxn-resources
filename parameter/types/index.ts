import * as cdk from "aws-cdk-lib";

// FSxNファイルシステムとSVM関連の情報
export interface FsxnFileSystemProperty {
  fileSystemId: string; // FSxNファイルシステムのID
  storageVirtualMachineId: string; // SVMのID
}

// FSxNボリュームの情報
export interface FsxnVolumeProperty {
  name: string; // ボリュームの名前
  junctionPath: string; // ボリュームのジャンクションパス
  securityStyle: "UNIX" | "NTFS"; // セキュリティスタイル
  sizeInMegabytes: string; // ボリュームのサイズ
  snapshotPolicy?: string; // Snapshot Policy
  storageEfficiencyEnabled?: "true" | "false"; // Storage Efficiencyの有効化有無
  tieringPolicy: cdk.aws_fsx.CfnVolume.TieringPolicyProperty; // Tiering Policy
}

export interface FsxnVolumesProperty {
  volumes: FsxnVolumeProperty[];
}

// Prefix Listの情報
export interface PrefixListsProperty {
  prefixLists: cdk.aws_ec2.PrefixListProps[];
}

// Security Groupのインバウンドルール
export interface SecurityGroupRuleProperty {
  peer: cdk.aws_ec2.IPeer; // 送信元
  connection: cdk.aws_ec2.Port; // 送信先ポート
  description: string; // 説明
}

// Security Groupの情報
export interface SecurityGroupProperty {
  vpcId: string; // Security Groupが作成されるVPCのID
  name?: string; // Security Groupの名前
  description?: string; // 説明
  rules: SecurityGroupRuleProperty[]; // インバウンドルール
}

// KMSキーの情報
export interface KmsKeyProperty {
  alias?: string; // KMSキーのエイリアス
  description?: string; // 説明
  enabled?: boolean; // 有効か否か
  enableKeyRotation?: boolean; // 定期的なローテーションを行うか否か
  rotationPeriod?: cdk.Duration; // ローテーション間隔
}

// Backup Vaultの情報
export interface VaultProperty {
  accessPolicy?: cdk.aws_iam.PolicyDocument; // アクセスポリシーの定義
  name?: string; // Backup Vaultの名前
  blockRecoveryPointDeletion?: boolean; // 復旧ポイントの削除を許可するか否か
  encryptionKeyAlias?: string; // 使用するKMSキーのエイリアス
  lockConfiguration?: cdk.aws_backup.LockConfiguration; // Vault Lockの設定
}

export interface BackupProperty {
  backupVault: VaultProperty;
  backupPlanRule: cdk.aws_backup.BackupPlanRuleProps; // Backup Planのルール
  planName?: string; // Backup Planの名前
  selectionName: string; // Backup Selectionの名前
}

// 監視に関連する情報
export interface MonitoringProperty {
  rootVolumeId?: string; // SVMのルートボリュームのID
  addFsvolIdNames?: {
    id: string;
    name: string;
  }[];
  enableInodeUsageMonitoring: boolean; // inode監視を行うか否か
  enableOkAction?: boolean; // OK 状態になったタイミングで通知を行うか否か
  topicName?: string; // SNS Topicの名前
  emailAddresses?: string[]; // SNS Topicのサブスクリプションとして設定するメールアドレス
}

// 全リソース共通に設定したいタグ
export interface TagProperty {
  key: string;

  value: string;
}

// 全リソース共通に設定したいRemovalPolicy
export type RemovalPolicyProperty = cdk.RemovalPolicy;

// システム情報
export interface SystemProperty {
  systemName: string; // システム名
  envName: string; // 環境名
}

export interface FsxnResourcesProperty {
  systemProperty?: SystemProperty;
  kmsKeyProperty?: KmsKeyProperty;
  prefixListsProperty?: PrefixListsProperty;
  securityGroupProperty?: SecurityGroupProperty;
  fsxnFileSystemProperty?: FsxnFileSystemProperty;
  backupProperty?: BackupProperty;
  fsxnVolumesProperty?: FsxnVolumesProperty;
  monitoringProperty?: MonitoringProperty;
  removalPolicyProperty?: RemovalPolicyProperty;
}

// CFn Stackのプロパティを表すInterface
export interface FsxnResourcesStackProperty {
  env?: cdk.Environment;
  props: FsxnResourcesProperty;
  tags?: TagProperty[];
}
