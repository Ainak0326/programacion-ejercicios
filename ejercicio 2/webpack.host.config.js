const path = require("path");
const { ModuleFederationPlugin } = require("webpack").container;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const makeCommon = require("./webpack.common");

module.exports = {
  ...makeCommon({
    uniqueName: "shell",
    outputPath: path.resolve(__dirname, "dist/shell"),
    tsconfigPath: "tsconfig.host.json"
  }),
  entry: path.resolve(__dirname, "src/main.ts"),
  devServer: {
    port: 4200,
    historyApiFallback: true
  },
  plugins: [
    ...makeCommon({
      uniqueName: "shell",
      outputPath: path.resolve(__dirname, "dist/shell"),
      tsconfigPath: "tsconfig.host.json"
    }).plugins,
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html")
    }),
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {},
      shared: {
        "@angular/core": { singleton: true, strictVersion: false, requiredVersion: false },
        "@angular/common": { singleton: true, strictVersion: false, requiredVersion: false },
        "@angular/router": { singleton: true, strictVersion: false, requiredVersion: false },
        "@angular/forms": { singleton: true, strictVersion: false, requiredVersion: false },
        "rxjs": { singleton: true, strictVersion: false, requiredVersion: false }
      }
    })
  ]
};
