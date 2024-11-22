import { FsxnVolumesProperty } from "../types";

export const fsxnVolumesConfig: FsxnVolumesProperty = {
  volumes: [
    {
      name: "vol_test1",
      junctionPath: "/vol_test1",
      securityStyle: "NTFS",
      sizeInMegabytes: "10240",
      snapshotPolicy: "none",
      storageEfficiencyEnabled: "false",
      tieringPolicy: {
        coolingPeriod: 5,
        name: "AUTO",
      },
    },
    {
      name: "vol_test2",
      junctionPath: "/vol_test2",
      securityStyle: "NTFS",
      sizeInMegabytes: "2048",
      snapshotPolicy: "default",
      storageEfficiencyEnabled: "true",
      tieringPolicy: {
        name: "ALL",
      },
    },
  ],
};
