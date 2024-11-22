import * as cdk from "aws-cdk-lib";
import { PrefixListsProperty } from "../types";

export const prefixListsConfig: PrefixListsProperty = {
  prefixLists: [
    {
      addressFamily: cdk.aws_ec2.AddressFamily.IP_V4,
      entries: [
        { cidr: "10.0.0.10/32" },
        { cidr: "10.0.0.20/32", description: "sample1" },
      ],
      maxEntries: 10,
      prefixListName: "SMB",
    },
    {
      entries: [{ cidr: "10.0.0.30/32" }],
      prefixListName: "ICMP",
    },
  ],
};
