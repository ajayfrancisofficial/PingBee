declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL: string;
    WS_BASE_URL: string;
    RENDER_BASE_URL: string;
    RENDER_WS_BASE_URL: string;
  }
  export const Config: NativeConfig;
  export default Config;
}
