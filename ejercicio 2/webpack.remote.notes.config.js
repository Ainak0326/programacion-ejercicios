const path = require("path");
const { ModuleFederationPlugin } = require("webpack").container;
const makeCommon = require("./webpack.common");

module.exports = {
  ...makeCommon({
    uniqueName: "remoteNotes",
    outputPath: path.resolve(__dirname, "dist/remote-notes"),
    tsconfigPath: "tsconfig.remote.notes.json"
  }),
  entry: path.resolve(__dirname, "remotes/notes/src/remote-entry.ts"),
  devServer: {
    port: 4202,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  plugins: [
    ...makeCommon({
      uniqueName: "remoteNotes",
      outputPath: path.resolve(__dirname, "dist/remote-notes"),
      tsconfigPath: "tsconfig.remote.notes.json"
    }).plugins,
    new ModuleFederationPlugin({
      name: "remoteNotes",
      filename: "remoteEntry.js",
      exposes: {
        "./Widget": path.resolve(__dirname, "remotes/notes/src/widget.module.ts")
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: false, requiredVersion: false },
        "@angular/common": { singleton: true, strictVersion: false, requiredVersion: false },
        "rxjs": { singleton: true, strictVersion: false, requiredVersion: false }
      }
    })
  ]
};
