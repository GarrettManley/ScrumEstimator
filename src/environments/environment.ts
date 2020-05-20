const packageInfo = require("../../package.json");

export const environment = {
  production: false,
  version: packageInfo.version,
};
