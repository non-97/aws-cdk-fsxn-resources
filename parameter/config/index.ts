import { FsxnResourcesStackProperty } from "../types";
import { systemConfig } from "./system-config";
import { kmsKeyConfig } from "./kms-config";
import { securityGroupConfig } from "./securitygroup-config";
import { prefixListsConfig } from "./pl-config";
import { fsxnFileSystemConfig } from "./fsxn-filesystem-config";
import { backupConfig } from "./backup-config";
import { fsxnVolumesConfig } from "./fsxn-volume-config";
import { monitoringConfig } from "./monitoring-config";
import { tagsConfig } from "./tags-config";

export const fsxnResourcesStackProperty: FsxnResourcesStackProperty = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  props: {
    systemProperty: systemConfig,
    kmsKeyProperty: kmsKeyConfig,
    prefixListsProperty: prefixListsConfig,
    securityGroupProperty: securityGroupConfig,
    fsxnFileSystemProperty: fsxnFileSystemConfig,
    backupProperty: backupConfig,
    fsxnVolumesProperty: fsxnVolumesConfig,
    monitoringProperty: monitoringConfig,
  },
  tags: tagsConfig,
};

export {
  systemConfig,
  kmsKeyConfig,
  prefixListsConfig,
  securityGroupConfig,
  fsxnFileSystemConfig,
  backupConfig,
  fsxnVolumesConfig,
  monitoringConfig,
  tagsConfig,
};
