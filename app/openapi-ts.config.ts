import { defineConfig } from "@hey-api/openapi-ts";

const midgardAPI = defineConfig({
  input: "https://midgard.ninerealms.com/v2/swagger.json",
  output: {
    format: "prettier",
    lint: "eslint",
    path: "midgard",
  },
  plugins: ['@hey-api/client-fetch'],
});

const thornodeAPI = defineConfig({
  input: "https://thornode.ninerealms.com/thorchain/doc/openapi.yaml",
  output: {
    format: "prettier",
    lint: "eslint",
    path: "thornode",
  },
  plugins: ['@hey-api/client-fetch'],
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
