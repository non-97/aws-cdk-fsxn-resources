import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { BaseConstructProps, BaseConstruct } from "./base-construct";
import { KmsKeyProperty } from "../../parameter";

export interface KmsConstructProps extends BaseConstructProps {
  kmsKeyProperty: KmsKeyProperty;
}

export class KmsConstruct extends BaseConstruct {
  constructor(scope: Construct, id: string, props: KmsConstructProps) {
    super(scope, id, props);

    const alias = props.systemProperty
      ? this.generateResourceName("key", props.kmsKeyProperty.alias)
      : props.kmsKeyProperty.alias;

    const key = new cdk.aws_kms.Key(this, "Default", {
      ...props.kmsKeyProperty,
      alias,
    });

    if (alias) {
      cdk.Tags.of(key).add("Name", alias);
    }
  }
}
