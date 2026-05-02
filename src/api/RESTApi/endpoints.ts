export const API_BASE_URL = 'https://chat-app-81bx.onrender.com';
export const WS_BASE_URL = 'wss://chat-app-81bx.onrender.com/ws';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    REFRESH_TOKEN: '/refresh',
    SEND_VERIFICATION: '/send-verification',
    VERIFY_EMAIL: '/verify-email',
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
  },
};
