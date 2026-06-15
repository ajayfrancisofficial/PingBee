# PingBee Project Rules for AI Agents

## Codebase Purpose
PingBee is an offline-first, real-time messaging application structured as a "Digital Hive" with a friendly, warm, bee-themed visual identity.
The codebase is a **React Native** client that utilizes **WatermelonDB** for persistent offline-first data, **Zustand** and **TanStack Query** for state management, and **WebSockets** (backed up by REST APIs) for real-time synchronization.

## Critical Files
- **Database & Architecture**:
  - [src/db/schema.ts](file:///Users/ajayfrancis/Projects/PingBee/src/db/schema.ts) — The database schema for `users`, `chats`, `messages`, and `chat_participants`.
  - [src/db/models/Message.ts](file:///Users/ajayfrancis/Projects/PingBee/src/db/models/Message.ts), [Chat.ts](file:///Users/ajayfrancis/Projects/PingBee/src/db/models/Chat.ts), [User.ts](file:///Users/ajayfrancis/Projects/PingBee/src/db/models/User.ts), [ChatParticipant.ts](file:///Users/ajayfrancis/Projects/PingBee/src/db/models/ChatParticipant.ts) — WatermelonDB models specifying relations and properties.
- **Services & Real-Time Sync**:
  - [src/services/Websocket/websocketService.ts](file:///Users/ajayfrancis/Projects/PingBee/src/services/Websocket/websocketService.ts) — Handles incoming WebSocket messages (`RECEIVE_MSG`, `RECEIVE_EDIT_MSG`, `RECEIVE_DELETE_MSGS`, `MSG_STATUS`, etc.) and performs local WatermelonDB transactions.
  - [src/services/Sync/OutgoingSync.ts](file:///Users/ajayfrancis/Projects/PingBee/src/services/Sync/OutgoingSync.ts) — Retries pending edits, deletes, and unsent messages when connection transitions from offline to online.
  - [src/services/Chat/messageController.ts](file:///Users/ajayfrancis/Projects/PingBee/src/services/Chat/messageController.ts) — Directs sending, editing, and deleting messages locally first, then dispatching to WebSockets.
- **UI Components & Themes**:
  - [src/components/chat/ChatBox.tsx](file:///Users/ajayfrancis/Projects/PingBee/src/components/chat/ChatBox.tsx) — Main chat room component containing list logs, selection modes, typing indicator animations, and date separators.
  - [DESIGN.md](file:///Users/ajayfrancis/Projects/PingBee/DESIGN.md) — The visual design spec.
  - [src/theme/colors.ts](file:///Users/ajayfrancis/Projects/PingBee/src/theme/colors.ts) — The theme configuration files containing Honey Gold brand color values and surface elevations.

## Project Goals & Key Workflows
- **Offline-First Synchronization**: Real-time messaging uses a local-first pattern: messages are written to local database instantly with status `pending` or `sent` and then pushed/synced online. If connection drops, mutations remain queued and sync resumes automatically on reconnection.
- **WebSocket Message Updates**: Messages deleted/edited on the server or other devices send websocket updates which must propagate to all affected chats and update `last_message_text`, unread counts, and timestamps.
- **Strict Visual Cohesion**: The application theme enforces warm yellow/gold and honey hues in light mode and bright amber with charcoal grays in dark mode. All design components must reference theme tokens from `useAppTheme`.

## Tech Stack
- **Framework**: React Native (0.84+)
- **Language**: TypeScript (Strict Mode)
- **State Management**: 
    - **Global**: Zustand (v5)
    - **Server State**: TanStack Query (v5)
    - **Local DB**: WatermelonDB (v0.28)
- **Navigation**: React Navigation (v7)
- **Styling**: Vanilla `StyleSheet` with a custom `useAppTheme` hook and `makeStyles` pattern.
- **Icons**: Lucide React Native

## Coding Standards
- **Components**: Use functional components with hooks. Prefer `useMemo` for styles and heavy computations.
- **Types**: Always define interfaces/types for props and data models. Avoid `any` at all costs.
- **Navigation**: **NEVER** use `any` type for `useNavigation()`. Always use proper types (e.g., `StaticParamList` from your stack) or rely on inference if possible.
- **Styling**: **ALWAYS** use values from the theme (`colors`, `spacing`, `typography`, `borderRadius`, `iconSizes`). Never use hardcoded pixel values for spacing or colors. Even icon sizes should come from `theme.iconSizes` (if available) or `theme.spacing`.
- **API**: Follow the pattern in `src/api/endpoints.ts` and use `axiosClient` for requests. All API modules (e.g., `authApi.ts`, `chatApi.ts`) MUST export a single constant object containing all methods (e.g., `export const chatApi = { ... }`). Individual named exports for API functions are forbidden.
- **Hooks**: Place reusable logic in `src/hooks/`. **ALWAYS** extract complex state and side-effect logic (e.g., search, pagination, form handling) from screens into dedicated custom hooks in `src/hooks/` to keep screen components simple and focused on layout/UI.
- **Database**: Use WatermelonDB models in `src/db/models/` and handle queries through dedicated hooks (e.g., `src/hooks/db/`).
- **Asynchronicity**: **ALWAYS** use `async/await` with `try/catch` for promise handling. **NEVER** use `.then().catch()`.

## Operational Guidelines
- **Development**: Use `yarn android` or `yarn ios` to run the app.
- **State Persistence**: Sensitive data should be handled via `react-native-keychain` or `react-native-mmkv`.
- **Animations**: Use `react-native-reanimated` (v4) for complex UI transitions.

## Project Structure
- `src/api`: API endpoints and axios client.
- `src/components`: Reusable UI components.
- `src/db`: WatermelonDB models, schema, and migrations.
- `src/hooks`: Custom React hooks (logic, db queries, theme).
- `src/screens`: Main application screens.
- `src/theme`: Theme configuration and color palettes.

## Agent Instructions
- When adding new features, check for existing patterns in `src/screens/ChatsScreen.tsx`.
- When creating API calls, update `src/api/endpoints.ts` first.
- Always prefer local DB (WatermelonDB) for offline-first capabilities where applicable.
- **NEVER** write direct `axios` or `apiClient` calls in services (`src/services/`). All API call logic MUST be implemented in the API layer (`src/api/RESTApi/`) and then called from services.
- If you need to run the app, the terminal command is `yarn android`.
