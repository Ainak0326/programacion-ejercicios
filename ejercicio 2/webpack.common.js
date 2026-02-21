const sass = require("sass");
const path = require("path");
const { AngularWebpackPlugin } = require("@ngtools/webpack");

module.exports = (options) => ({
  mode: "development",
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "@ngtools/webpack"
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: sass,
              api: "modern-compiler"
            }
          }
        ]
      }
    ]
  },
  output: {
    uniqueName: options.uniqueName,
    publicPath: "auto",
    clean: true,
    path: options.outputPath
  },
  plugins: [
    new AngularWebpackPlugin({
      tsconfig: path.resolve(__dirname, options.tsconfigPath),
      jitMode: false
    })
  ]
});
