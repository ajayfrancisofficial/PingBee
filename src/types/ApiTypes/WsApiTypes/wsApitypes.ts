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

import type { components, operations } from './generatedWsApiTypes';

// ── Utility extractors ────────────────────────────────────────────────────────

/** Extract the 200 success response body for a given operation key. */
type SuccessBody<T extends keyof operations> =
  operations[T]['responses'][200]['content']['application/json'];

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
  ACK_DELETE_MSG: components['schemas']['AckDeleteMessagePayload'];
  RECEIVE_DELETE_MSG: components['schemas']['ReceiveDeleteMessagePayload'];
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
export type AckDeleteMessagePayload =
  components['schemas']['AckDeleteMessagePayload'];
export type ReceiveDeleteMessagePayload =
  components['schemas']['ReceiveDeleteMessagePayload'];
export type ErrorPayload = components['schemas']['ErrorPayload'];

// ── Client Payload Aliases ───────────────────────────────────────────────────

export type SendMessagePayload = components['schemas']['SendMessagePayload'];

// ── Operation response types ──────────────────────────────────────────────────

/** GET /server-message → 200 response */
export type ServerMessageResponse =
  SuccessBody<'server_msg_server_message_post'>;

/** GET /client-message → 200 response */
export type ClientMessageResponse =
  SuccessBody<'client_msg_client_message_post'>;

/** POST /payloads/send-message → 200 response */
export type SendMessagePayloadResponse =
  SuccessBody<'p1_payloads_send_message_post'>;
