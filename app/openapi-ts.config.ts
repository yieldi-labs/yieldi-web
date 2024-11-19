import { defineConfig } from "@hey-api/openapi-ts";

const midgardAPI = defineConfig({
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

const thornodeAPI = defineConfig({
  client: "@hey-api/client-fetch",
  input: "./thornode-schema.json",
  output: {
    format: "prettier",
    lint: "eslint",
    path: "thornode",
  },
  schemas: {
    type: "json",
  },
});

let configExport;
switch (process.env.API_SPEC) {
  case "midgard": {
    configExport = midgardAPI;
    break;
  }
  case "thornode": {
    configExport = thornodeAPI;
    break;
  }
  default:
    throw Error("must specify valid API_SPEC env var");
}

export default configExport;
