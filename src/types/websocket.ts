// ─── Outgoing (client → server) ───────────────────────────

export interface WSMsgPayload {
  tempId: string;
  chatId: string;
  text: string;
  senderId: string;
  createdAt: string; // ISO string
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  replyToId?: string;
}

export interface WSOutgoingMsg {
  type: 'MSG';
  payload: WSMsgPayload;
}

// ─── Incoming (server → client) ───────────────────────────

export interface WSIncomingMsg {
  type: 'MSG';
  payload: {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: string;
    serverTimestamp: number;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'file';
    replyToId?: string;
  };
}

export interface WSAck {
  type: 'ACK';
  payload: {
    tempId: string;
    serverTimestamp: number;
  };
}

export interface WSStatus {
  type: 'STATUS';
  payload: {
    messageId: string;
    status: 'delivered' | 'read';
  };
}

export type WSIncomingPayload = WSIncomingMsg | WSAck | WSStatus;
export type WSOutgoingPayload = WSOutgoingMsg;
