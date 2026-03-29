/* ——————————————————————————————————————————————————————————————————————————————————————
   COMMON TYPES
   —————————————————————————————————————————————————————————————————————————————————————— */

export interface WSMsgPayload {
  id: string; // Internal WatermelonDB ID used as global ID
  chatId: string;
  text: string;
  senderId: string;
  createdAt: string; // ISO string
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  replyToId?: string;
}

/* ——————————————————————————————————————————————————————————————————————————————————————
   CLIENT → SERVER (OUTGOING)
   —————————————————————————————————————————————————————————————————————————————————————— */

export interface WSSendMsg {
  type: 'SEND_MSG';
  payload: WSMsgPayload;
}

export interface WSEditMsg {
  type: 'EDIT_MSG';
  payload: {
    id: string; // The message ID to edit
    text: string;
    editedAt: string;
  };
}

export interface WSDeleteMsg {
  type: 'DELETE_MSG';
  payload: {
    id: string;
    deleteType: 'deleteForEveryone' | 'deleteForMe';
    deletedAt: string;
  };
}

export interface WSTypingMsg {
  type: 'TYPING';
  payload: {
    chatId: string;
    userId: string; // Server adds this, client omits it in outgoing
    isTyping: boolean;
  };
}

/* ——————————————————————————————————————————————————————————————————————————————————————
   SERVER → CLIENT (INCOMING)
   —————————————————————————————————————————————————————————————————————————————————————— */

export interface WSReceivedMsg {
  type: 'SEND_MSG';
  payload: WSMsgPayload & { serverTimestamp: number };
}

export interface WSAckMsg {
  type: 'ACK_MSG';
  payload: {
    id: string; // The original ID acknowledging
    serverTimestamp: number;
  };
}

export interface WSAckEditMsg {
  type: 'ACK_EDIT_MSG';
  payload: {
    id: string;
    editedAt: number;
  };
}

export interface WSAckDeleteMsg {
  type: 'ACK_DELETE_MSG';
  payload: {
    id: string;
    deletedAt: number;
  };
}

export interface WSMsgStatus {
  type: 'MSG_STATUS';
  payload: {
    messageId: string;
    status: 'delivered' | 'read';
  };
}

/* ——————————————————————————————————————————————————————————————————————————————————————
   UNIFIED PAYLOAD TYPES
   —————————————————————————————————————————————————————————————————————————————————————— */

export type WSIncomingPayload = 
  | WSReceivedMsg 
  | WSAckMsg 
  | WSMsgStatus 
  | WSEditMsg 
  | WSAckEditMsg 
  | WSDeleteMsg 
  | WSAckDeleteMsg 
  | WSTypingMsg;

export type WSOutgoingPayload = 
  | WSSendMsg 
  | WSEditMsg 
  | WSDeleteMsg 
  | (Omit<WSTypingMsg, 'payload'> & { payload: Omit<WSTypingMsg['payload'], 'userId'> });
