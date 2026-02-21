const path = require("path");
const { ModuleFederationPlugin } = require("webpack").container;
const makeCommon = require("./webpack.common");

module.exports = {
  ...makeCommon({
    uniqueName: "remoteAnalytics",
    outputPath: path.resolve(__dirname, "dist/remote-analytics"),
    tsconfigPath: "tsconfig.remote.analytics.json"
  }),
  entry: path.resolve(__dirname, "remotes/analytics/src/remote-entry.ts"),
  devServer: {
    port: 4201,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  plugins: [
    ...makeCommon({
      uniqueName: "remoteAnalytics",
      outputPath: path.resolve(__dirname, "dist/remote-analytics"),
      tsconfigPath: "tsconfig.remote.analytics.json"
    }).plugins,
    new ModuleFederationPlugin({
      name: "remoteAnalytics",
      filename: "remoteEntry.js",
      exposes: {
        "./Widget": path.resolve(__dirname, "remotes/analytics/src/widget.module.ts")
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: false, requiredVersion: false },
        "@angular/common": { singleton: true, strictVersion: false, requiredVersion: false },
        "rxjs": { singleton: true, strictVersion: false, requiredVersion: false }
      }
    })
  ]
};
