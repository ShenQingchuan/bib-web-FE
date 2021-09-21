import { MarkType, Schema } from "prosemirror-model";

export function getMarkType(
  nameOrType: string | MarkType,
  schema: Schema
): MarkType {
  if (typeof nameOrType === "string") {
    return schema.marks[nameOrType];
  }

  return nameOrType;
}
