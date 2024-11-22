import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { BaseConstructProps, BaseConstruct } from "./base-construct";
import { SecurityGroupProperty } from "../../parameter";

export interface SecurityGroupConstructProps extends BaseConstructProps {
  securityGroupProperty: SecurityGroupProperty;
}

export class SecurityGroupConstruct extends BaseConstruct {
  constructor(
    scope: Construct,
    id: string,
    props: SecurityGroupConstructProps
  ) {
    super(scope, id, props);

    const vpc = cdk.aws_ec2.Vpc.fromLookup(this, "Vpc", {
      vpcId: props.securityGroupProperty.vpcId,
    });

    const securityGroupName = props.systemProperty
      ? this.generateResourceName("sg", props.securityGroupProperty.name)
      : props.securityGroupProperty.name;

    const sg = new cdk.aws_ec2.SecurityGroup(this, "Default", {
      vpc,
      securityGroupName,
      description: props.securityGroupProperty.description,
    });
    props.securityGroupProperty.rules.forEach((rule) => {
      sg.addIngressRule(rule.peer, rule.connection, rule.description);
    });

    if (securityGroupName) {
      cdk.Tags.of(sg).add("Name", securityGroupName);
    }
  }
}
