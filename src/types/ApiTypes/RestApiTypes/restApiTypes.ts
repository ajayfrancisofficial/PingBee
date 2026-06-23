/**
 * restApiTypes.ts
 *
 * Derived types extracted from the auto-generated OpenAPI spec.
 * DO NOT hand-edit types here — instead update the backend and run `yarn sync-types`.
 *
 * Pattern:
 *   - Schema aliases  → extracted from components['schemas']
 *   - Response types  → extracted from operations[op]['responses'][200]['content']['application/json']
 *   - Path params     → extracted from operations[op]['parameters']['path']
 *   - Query params    → extracted from operations[op]['parameters']['query']
 */

import type { components, operations } from './generatedRestApiTypes';

// ── Utility extractors ────────────────────────────────────────────────────────

/** Extract the 200 success response body for a given operation key. */
type SuccessBody<T extends keyof operations> =
  operations[T]['responses'][200]['content']['application/json'];

/** Extract path parameters for a given operation key. */
type PathParams<T extends keyof operations> =
  operations[T]['parameters']['path'];

/** Extract query parameters for a given operation key. */
type QueryParams<T extends keyof operations> =
  operations[T]['parameters']['query'];

// ── Schema aliases (request bodies & shared models) ──────────────────────────

/** POST /register — request body */
export type UserRegisterBody = components['schemas']['UserRegister'];

/** POST /login — request body */
export type UserLoginBody = components['schemas']['UserLogin'];

/** POST /refresh — request body */
export type RefreshTokenBody = components['schemas']['RefreshTokenRequest'];

/** POST /send-verification — request body */
export type ResendOTPBody = components['schemas']['ResendOTP'];

/** POST /verify-email — request body */
export type EmailVerificationBody = components['schemas']['EmailVerification'];

/** POST /forgot-password — request body */
export type ForgotPasswordBody = components['schemas']['ForgotPasswordRequest'];

/** POST /verify-forgot-password-otp — request body */
export type VerifyForgotOTPBody = components['schemas']['VerifyOTPRequest'];

/** POST /reset-password — request body */
export type ResetPasswordBody =
  components['schemas']['ResetPasswordByIdRequest'];

/** POST /user-search — request body */
export type UserSearchBody = components['schemas']['UserSearchRequest'];

/** POST /conversation — request body */
export type ConversationCreateBody =
  components['schemas']['ConversationCreateRequest'];

/** POST /messages — request body */
export type MessageFetchBody = components['schemas']['MessageFetchRequest'];

/** POST /mark-as-read — request body */
export type MarkAsReadBody = components['schemas']['MarkAsReadRequest'];

/**
 * Successful token response from POST /login and POST /refresh.
 * Note: fields are snake_case — `access_token`, `refresh_token`, `token_type`.
 */
export type TokenResponse = components['schemas']['Token'];

/** FastAPI validation error detail item */
export type ValidationError = components['schemas']['ValidationError'];

/** FastAPI validation error wrapper (422 response) */
export type HTTPValidationError = components['schemas']['HTTPValidationError'];

/** Standard error response for 400, 401, 404, 500 errors */
export type ErrorResponse = components['schemas']['ErrorResponse'];

/** Detail object inside an ErrorResponse */
export type ErrorDetail = components['schemas']['ErrorDetail'];

/** User profile data from /me */
export type UserProfile = components['schemas']['UserMeResponse'];

/** Data returned on login/register */
export type AuthData = components['schemas']['AuthResponseData'];

/** Individual chat item in the list */
export type ChatItem = components['schemas']['ChatItem'];

/** List of chats */
export type ChatList = components['schemas']['ChatList'];

/** Individual message item */
export type MessageItem = components['schemas']['MessageItem'];

/** List of messages */
export type MessageList = components['schemas']['MessageList'];

/** User search result item */
export type UserSearchResponse = components['schemas']['UserSearchResponse'];

/** List of users */
export type UserList = components['schemas']['UserList'];

/** Conversation ID container */
export type ConversationID = components['schemas']['ConversationID'];

// ── Operation response types ──────────────────────────────────────────────────

/** POST /login → 200 response (wrapped in StandardResponse) */
export type LoginSuccessResponse = SuccessBody<'user_login_login_post'>;

/** POST /register → 200 response (wrapped in StandardResponse) */
export type RegisterSuccessResponse =
  SuccessBody<'user_register_register_post'>;

/** POST /refresh → 200 response (wrapped in StandardResponse) */
export type RefreshSuccessResponse = SuccessBody<'refresh_token_refresh_post'>;

/** GET /me → 200 response */
export type GetMeResponse = SuccessBody<'get_me_me_get'>;

/** POST /users → 200 response */
export type GetAllUsersResponse = SuccessBody<'get_all_users_users_post'>;

/** POST /user-search → 200 response */
export type SearchUsersResponse = SuccessBody<'search_users_user_search_post'>;

/** POST /users-avatar → 200 response */
export type UploadAvatarResponse =
  SuccessBody<'upload_avatar_users_avatar_post'>;

/** DELETE /users-avatar → 200 response */
export type DeleteAvatarResponse =
  SuccessBody<'delete_avatar_users_avatar_delete'>;

/** POST /conversation → 200 response */
export type ConversationResponse =
  SuccessBody<'create_or_get_conversation_conversation_post'>;

/** POST /messages → 200 response */
export type GetMessagesResponse = SuccessBody<'get_messages_messages_post'>;

/** POST /mark-as-read → 200 response */
export type MarkAsReadResponse = SuccessBody<'mark_as_read_mark_as_read_post'>;

/** GET /chats → 200 response */
export type GetChatsResponse = SuccessBody<'get_user_chats_chats_get'>;

/** POST /send-verification → 200 response */
export type SendVerificationResponse =
  SuccessBody<'send_verification_send_verification_post'>;

/** POST /verify-email → 200 response */
export type VerifyEmailResponse = SuccessBody<'verify_email_verify_email_post'>;

/** POST /forgot-password → 200 response */
export type ForgotPasswordResponse =
  SuccessBody<'forgot_password_forgot_password_post'>;

/** POST /verify-forgot-password-otp → 200 response */
export type VerifyForgotOTPResponse =
  SuccessBody<'verify_forgot_password_otp_verify_forgot_password_otp_post'>;

/** POST /reset-password → 200 response */
export type ResetPasswordResponse =
  SuccessBody<'reset_password_reset_password_post'>;

/** GET / → 200 response */
export type RootResponse = SuccessBody<'root__get'>;

/** POST /chat-users-details → request body */
export type ChatUserDetailsBody =
  components['schemas']['ChatUserDetailsRequest'];

/** POST /chat-users-details → 200 response */
export type ChatUserDetailsResponse =
  SuccessBody<'get_chat_users_details_chat_users_details_post'>;

// ── Path parameter types ──────────────────────────────────────────────────────

// No active path parameters in current spec.

// ── Query parameter types ─────────────────────────────────────────────────────

// No active query parameters in current spec.

// ── FCM Push Notification types ──────────────────────────────────────────────

/** POST /fcm-token — request body */
export type SaveFcmTokenBody = components['schemas']['FCMTokenRegisterRequest'];

/** POST /fcm-token — success response */
export type SaveFcmTokenResponse =
  SuccessBody<'register_fcm_token_fcm_token_post'>;

/** DELETE /fcm-token — request body */
export type DeleteFcmTokenBody = components['schemas']['FCMTokenDeleteRequest'];

/** DELETE /fcm-token — success response */
export type DeleteFcmTokenResponse =
  SuccessBody<'delete_fcm_token_fcm_token_delete'>;

// ── Pingy AI Chatbot types ──────────────────────────────────────────────────

/** Data returned by the /pingy-details endpoint */
export type PingyDetails = components['schemas']['PingyDetails'];

/** GET /pingy-details — response */
export type PingyDetailsResponse =
  SuccessBody<'get_pingy_details_pingy_details_get'>;
