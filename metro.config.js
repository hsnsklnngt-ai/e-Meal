const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo'ya hem .db hem de .sqlite uzantılı dosyaları paketlemesini söylüyoruz[cite: 6]
config.resolver.assetExts.push('db', 'sqlite');

module.exports = config;