#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FsxnResourcesStack } from "../lib/fsxn-resources-stack";
import { fsxnResourcesStackProperty } from "../parameter/index";

const app = new cdk.App();

const stackName = fsxnResourcesStackProperty.props.systemProperty
  ? `${fsxnResourcesStackProperty.props.systemProperty.systemName}-${fsxnResourcesStackProperty.props.systemProperty.envName}-stack-fsxn-resources`
  : "FsxnResourcesStack";

const stack = new FsxnResourcesStack(app, stackName, {
  env: fsxnResourcesStackProperty.env,
  ...fsxnResourcesStackProperty.props,
  terminationProtection: true,
});

fsxnResourcesStackProperty.tags?.forEach((tag) => {
  cdk.Tags.of(stack).add(tag.key, tag.value);
});
