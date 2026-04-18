import type { SchemaNode } from "../lib/site-schema";

type StructuredDataProps = {
  data: SchemaNode | SchemaNode[];
  id?: string;
};

function serializeStructuredData(data: SchemaNode | SchemaNode[]) {
  return JSON.stringify(data).replace(/</gu, "\\u003c");
}

export function StructuredData({ data, id }: StructuredDataProps) {
  const payload = Array.isArray(data) ? data : [data];

  if (payload.length === 0) {
    return null;
  }

  const schemaPayload: SchemaNode | SchemaNode[] = payload.length === 1 ? payload[0] ?? {} : payload;
  const serializedSchema = serializeStructuredData(schemaPayload);

  return (
    <script id={id} type="application/ld+json">
      {serializedSchema}
    </script>
  );
}
