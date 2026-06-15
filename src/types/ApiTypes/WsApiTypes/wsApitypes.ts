/**
 * wsApitypes.ts
 *
 * Derived types extracted from the auto-generated WebSocket OpenAPI spec.
 * DO NOT hand-edit types here — instead update the backend and run `yarn sync-types`.
 *
 * Pattern:
 *   - Schema aliases  → extracted from components['schemas']
 *   - Event mapping   → manually mapped for type-safe payload access
 */

import type { components } from './generatedWsApiTypes';

// ── Schema aliases (Server Events & Payloads) ──────────────────────────────────

/** Complete WebSocket Server Message */
export type WsServerMessage = components['schemas']['WsServerMessage'];

/** Complete WebSocket Client Message */
export type WsClientMessage = components['schemas']['WsClientMessage'];

/** Mapping of Server Event names to their respective Payload types */
export type ServerEventPayloads = {
  ACK_SEND_MSG: components['schemas']['AckSendMessagePayload'];
  RECEIVE_MSG: components['schemas']['ReceiveMessagePayload'];
  TYPING: components['schemas']['TypingBroadcastPayload'];
  MSG_STATUS: components['schemas']['MessageStatusBroadcastPayload'];
  PRESENCE: components['schemas']['PresenceBroadcastPayload'];
  ACK_EDIT_MSG: components['schemas']['AckEditMessagePayload'];
  RECEIVE_EDIT_MSG: components['schemas']['ReceiveEditMessagePayload'];
  ACK_DELETE_MSGS: components['schemas']['AckDeleteMultipleMessagesPayload'];
  RECEIVE_DELETE_MSGS: components['schemas']['ReceiveDeleteMultipleMessagesPayload'];
  ERROR: components['schemas']['ErrorPayload'];
};

/** All possible Server Event names */
export type ServerEvent = keyof ServerEventPayloads;

/**
 * A type-safe Server Message structure.
 * Use this to narrow down the payload based on the event.
 */
export interface ServerMessage<T extends ServerEvent> {
  event: T;
  payload: ServerEventPayloads[T];
  timestamp: string;
}

// ── Individual Payload Aliases ───────────────────────────────────────────────

export type AckSendMessagePayload =
  components['schemas']['AckSendMessagePayload'];
export type ReceiveMessagePayload =
  components['schemas']['ReceiveMessagePayload'];
export type TypingBroadcastPayload =
  components['schemas']['TypingBroadcastPayload'];
export type MessageStatusBroadcastPayload =
  components['schemas']['MessageStatusBroadcastPayload'];
export type PresenceBroadcastPayload =
  components['schemas']['PresenceBroadcastPayload'];
export type AckEditMessagePayload =
  components['schemas']['AckEditMessagePayload'];
export type ReceiveEditMessagePayload =
  components['schemas']['ReceiveEditMessagePayload'];
export type AckDeleteMultipleMessagesPayload =
  components['schemas']['AckDeleteMultipleMessagesPayload'];
export type AckDeleteMultipleMessagesItem =
  components['schemas']['AckDeleteMultipleMessagesItem'];
export type ReceiveDeleteMultipleMessagesPayload =
  components['schemas']['ReceiveDeleteMultipleMessagesPayload'];
export type ReceiveDeleteMultipleMessagesItem =
  components['schemas']['ReceiveDeleteMultipleMessagesItem'];
export type ErrorPayload = components['schemas']['ErrorPayload'];

// ── Client Payload Aliases ───────────────────────────────────────────────────

export type SendMessagePayload = components['schemas']['SendMessagePayload'];
export type TypingPayload = components['schemas']['TypingPayload'];
export type MessageStatusPayload =
  components['schemas']['MessageStatusPayload'];
export type PresencePayload = components['schemas']['PresencePayload'];
export type EditMessagePayload = components['schemas']['EditMessagePayload'];
export type DeleteMultipleMessagesPayload =
  components['schemas']['DeleteMultipleMessagesPayload'];
export type DeleteMultipleMessagesItem =
  components['schemas']['DeleteMultipleMessagesItem'];

/** Mapping of Client Event names to their respective Payload types */
export type ClientEventPayloads = {
  SEND_MSG: SendMessagePayload;
  TYPING: TypingPayload;
  MSG_STATUS: MessageStatusPayload;
  PRESENCE: PresencePayload;
  EDIT_MSG: EditMessagePayload;
  DELETE_MSGS: DeleteMultipleMessagesPayload;
};

/** All possible Client Event names */
export type ClientEvent = keyof ClientEventPayloads;
