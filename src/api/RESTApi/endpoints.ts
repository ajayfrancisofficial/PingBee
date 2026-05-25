export const renderBaseUrl = 'https://chat-app-81bx.onrender.com';
export const renderWsBaseUrl = 'wss://chat-app-81bx.onrender.com/ws';

export const API_BASE_URL = 'https://api-pingbee.duckdns.org';
export const WS_BASE_URL = 'wss://api-pingbee.duckdns.org/ws';

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
  },
  CHATS: {
    LIST: '/chats',
    MESSAGES: '/messages',
    MARK_READ: '/mark-as-read',
    GET_CONVERSATION: '/conversation',
    USER_DETAILS: '/chat-users-details',
  },
};
