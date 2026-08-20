const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// Expo'ya .db uzantılı dosyaları da paketlemesini söylüyoruz
config.resolver.assetExts.push('db');
module.exports = config;