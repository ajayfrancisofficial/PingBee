export const API_BASE_URL = 'https://api.pingbee.com';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
  },
  CHATS: {
    LIST: '/chats',
    MESSAGES: (chatId: string) => `/chats/${chatId}/messages`,
  },
  SYNC: {
    MISSED: '/sync/missed',
  },
};
