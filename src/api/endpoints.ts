export const API_BASE_URL = 'https://chat-app-81bx.onrender.com';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    ME: '/me',
  },
  USERS: {
    LIST: '/users', // Note: This is a POST request in the API
    GET_CONVERSATION: (userId: string) => `/conversation/${userId}`,
  },
  CHATS: {
    LIST: '/chats',
    MESSAGES: (chatId: string) => `/messages/${chatId}`,
    SEND_MESSAGE: (chatId: string) => `/send-message/${chatId}`, // Requires ?message= query param
    MARK_READ: (chatId: string) => `/messages/read/${chatId}`,
  },
};
