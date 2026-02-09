import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import { VueLoaderPlugin } from 'vue-loader';

rules.push({
  test: /\.vue$/,
  use: [{ loader: 'vue-loader' }],
});

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: "postcss-loader" }],
});

export const rendererConfig: Configuration = {
  module: { rules },
  plugins: [...plugins, new VueLoaderPlugin()],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.vue'],
  },
};
