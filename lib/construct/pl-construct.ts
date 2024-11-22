import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { BaseConstructProps, BaseConstruct } from "./base-construct";
import { PrefixListsProperty } from "../../parameter";

export interface PlConstructProps extends BaseConstructProps {
  prefixListsProperty: PrefixListsProperty;
}

export class PlConstruct extends BaseConstruct {
  constructor(scope: Construct, id: string, props: PlConstructProps) {
    super(scope, id, props);

    props.prefixListsProperty.prefixLists.forEach((prefixListProps) => {
      const prefixListNamePascalCase = prefixListProps.prefixListName
        ? this.toPascalCase(prefixListProps.prefixListName)
        : "";

      const prefixListName = props.systemProperty
        ? this.generateResourceName("pl", prefixListProps.prefixListName)
        : prefixListProps.prefixListName;

      const prefixList = new cdk.aws_ec2.PrefixList(
        this,
        `PrefixList${prefixListNamePascalCase}`,
        {
          ...prefixListProps,
          prefixListName,
        }
      );

      if (prefixListName) {
        cdk.Tags.of(prefixList).add("Name", prefixListName);
      }
    });
  }
}
