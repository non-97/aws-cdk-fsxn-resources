import { MonitoringProperty } from "../types";

export const monitoringConfig: MonitoringProperty = {
  rootVolumeId: "fsvol-06f1c2447518dea35",
  addFsvolIdNames: [
    {
      id: "fsvol-044ffe12f2901ecb4",
      name: "fsvol-ntfs-dst",
    },
    {
      id: "fsvol-0fd3937dcf6bab0c6",
      name: "fsvol-ntfs",
    },
  ],
  enableInodeUsageMonitoring: true,
  enableOkAction: true,
};
