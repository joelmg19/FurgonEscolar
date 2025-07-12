const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  net: require.resolve('react-native-tcp-socket'),
  crypto: require.resolve('react-native-quick-base64'),
};

module.exports = defaultConfig;
