import Config from 'react-native-config';

export const renderBaseUrl = Config.RENDER_BASE_URL;
export const renderWsBaseUrl = Config.RENDER_WS_BASE_URL;

export const API_BASE_URL = Config.API_BASE_URL;
export const WS_BASE_URL = Config.WS_BASE_URL;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    REFRESH_TOKEN: '/refresh',
    SEND_VERIFICATION: '/send-verification',
    VERIFY_EMAIL: '/verify-email',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_FORGOT_OTP: '/verify-forgot-password-otp',
    RESET_PASSWORD: '/reset-password',
  },
  USERS: {
    ME: '/me',
    LIST: '/users',
    SEARCH: '/user-search',
    AVATAR_UPLOAD: '/users-avatar',
    AVATAR_DELETE: '/users-avatar',
  },
  CHATS: {
    LIST: '/chats',
    MESSAGES: '/messages',
    MARK_READ: '/mark-as-read',
    GET_CONVERSATION: '/conversation',
    USER_DETAILS: '/chat-users-details',
  },
  NOTIFICATIONS: {
    FCM_TOKEN: '/fcm-token',
  },
};
