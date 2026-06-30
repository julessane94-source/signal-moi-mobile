export default {
  expo: {
    name: 'Signal Moi',
    slug: 'signal-moi-mobile',
    scheme: 'signalmoi',
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    jsEngine: 'hermes',
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'sn.signalmoi.mobile',
      infoPlist: {
        NSCameraUsageDescription: 'Signal Moi utilise la camera pour envoyer une preuve ou lancer un live.',
        NSMicrophoneUsageDescription: 'Signal Moi utilise le micro pendant les lives citoyens.',
        NSLocationWhenInUseUsageDescription: 'Signal Moi utilise votre position reelle pour orienter les secours.'
      }
    },
    android: {
      package: 'sn.signalmoi.mobile',
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'CAMERA',
        'RECORD_AUDIO',
        'POST_NOTIFICATIONS'
      ]
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://signal-moi-api.onrender.com/api',
      socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || 'https://signal-moi-api.onrender.com'
    }
  }
}
