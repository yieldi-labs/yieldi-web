import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "@hey-api/client-fetch",
  input: "./midgard-schema.json",
  output: {
    format: "prettier",
    lint: "eslint",
    path: "midgard",
  },
  schemas: {
    type: "json",
  },
});
