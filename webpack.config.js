const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: {
    'zuck.js': './src/zuck.js',
    zuck: './src/zuck.css'
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', 'css']
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].min.css'
    })
  ],
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: (chunkData) => {
      let [name, extension] = chunkData.chunk.name.split('.');
      let suffix = devMode ? '' : '.min';

      if (extension) {
        extension = `.${extension}`;
      } else {
        suffix = '';
        extension = devMode ? '.css.js' : '.css.min.js';
      }

      return `${name}${suffix}${extension}`;
    },
    library: 'Zuck'
  },
  optimization: {
    minimize: !devMode,
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  },
  devServer: {
    contentBase: __dirname,
    host: '127.0.0.1',
    port: 8080
  }
};
