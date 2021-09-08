declare module "prosemirror-example-setup" {
  import { Plugin } from "prosemirror-state";
  import { Schema } from "prosemirror-model";

  function exampleSetup(options: {
    schema: Schema<any, any>;
    mapKeys?: Record<string, Record<string, string | boolean>>;
    menuBar?: boolean;
    history?: boolean;
    floatingMenu?: boolean;
    menuContent?: any;
  }): Plugin[];

  function buildKeymap(
    schema: Schema<any, any>,
    mapKeys?: Record<string, Record<string, string | boolean>>
  ): Record<string, any>;
}
