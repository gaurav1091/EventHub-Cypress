export const healthSchema = {
  jsonSchema: {
    type: "object",
    required: ["status", "dbStatus"],
    additionalProperties: true,
    properties: {
      status: { type: "string", enum: ["ok"] },
      dbStatus: { type: "string", enum: ["connected"] },
    },
  },
};
