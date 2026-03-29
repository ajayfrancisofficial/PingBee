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

export interface WSSendTyping {
  type: 'TYPING';
  payload: {
    chatId: string;
    isTyping: boolean;
  };
}

export interface WSSendMsgStatus {
  type: 'MSG_STATUS';
  payload: {
    messageId: string;
    status: 'delivered' | 'read';
  };
}

export interface WSSendPresence {
  type: 'PRESENCE';
  payload: {
    status: 'online' | 'offline';
  };
}

/* ——————————————————————————————————————————————————————————————————————————————————————
   SERVER → CLIENT (INCOMING)
   —————————————————————————————————————————————————————————————————————————————————————— */

export interface WSReceivedMsg {
  type: 'RECEIVE_MSG';
  payload: WSMsgPayload & { serverTimestamp: number };
}

export interface WSReceiveEditMsg {
  type: 'RECEIVE_EDIT_MSG';
  payload: {
    id: string;
    text: string;
    editedAt: string;
  };
}

export interface WSReceiveDeleteMsg {
  type: 'RECEIVE_DELETE_MSG';
  payload: {
    id: string;
    deleteType: 'deleteForEveryone' | 'deleteForMe';
    deletedAt: string;
  };
}

export interface WSAckSendMsg {
  type: 'ACK_SEND_MSG';
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

export interface WSReceiveTyping {
  type: 'TYPING';
  payload: {
    chatId: string;
    userId: string;
    isTyping: boolean;
  };
}

export interface WSReceiveMsgStatus {
  type: 'MSG_STATUS';
  payload: {
    messageId: string;
    status: 'delivered' | 'read';
  };
}

export interface WSReceivePresence {
  type: 'PRESENCE';
  payload: {
    userId: string;
    status: 'online' | 'offline';
  };
}

/* ——————————————————————————————————————————————————————————————————————————————————————
   UNIFIED PAYLOAD TYPES
   —————————————————————————————————————————————————————————————————————————————————————— */

export type WSIncomingPayload =
  | WSReceivedMsg
  | WSReceiveEditMsg
  | WSReceiveDeleteMsg
  | WSAckSendMsg
  | WSAckEditMsg
  | WSAckDeleteMsg
  | WSReceiveMsgStatus
  | WSReceiveTyping
  | WSReceivePresence;

export type WSOutgoingPayload =
  | WSSendMsg
  | WSEditMsg
  | WSDeleteMsg
  | WSSendTyping
  | WSSendMsgStatus
  | WSSendPresence;
