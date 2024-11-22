import * as cdk from "aws-cdk-lib";
import { SecurityGroupProperty } from "../types";

export const securityGroupConfig: SecurityGroupProperty = {
  vpcId: "vpc-043c0858ea33e8ec2",
  name: "fsxn",
  rules: [
    {
      peer: cdk.aws_ec2.Peer.prefixList("pl-0d1df59eaa666b077"),
      connection: cdk.aws_ec2.Port.SMB,
      description: "SMB",
    },
    {
      peer: cdk.aws_ec2.Peer.prefixList("pl-03be8a39ee35dc634"),
      connection: cdk.aws_ec2.Port.icmpPing(),
      description: "ICMP ping",
    },
    {
      peer: cdk.aws_ec2.Peer.ipv4("10.0.10.10/32"),
      connection: cdk.aws_ec2.Port.SSH,
      description: "SSH",
    },
  ],
};
