import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { chatApi } from './src/api/RESTApi/chatApi';

// Register background handler for FCM
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[FCM] Message handled in the background:', remoteMessage);

  const { data } = remoteMessage;
  if (!data || !data.type) {
    console.log('[FCM] Payload does not contain data or type. Skipping.');
    return;
  }

  try {
    switch (data.type) {
      case 'NEW_MESSAGE': {
        if (!data.id) {
          console.log('[FCM] NEW_MESSAGE payload does not contain message ID. Skipping.');
          break;
        }

        const messageId = String(data.id);
        // Call backend API to mark message as delivered
        try {
          await chatApi.markAsDelivered(messageId);
          console.log(
            `[FCM] Successfully acknowledged delivery for message: ${messageId}`,
          );
        } catch (apiErr) {
          console.error(
            '[FCM] Failed to call markAsDelivered API in background:',
            apiErr,
          );
        }
        break;
      }

      default:
        console.log(`[FCM] Unhandled background message type: ${data.type}`);
    }
  } catch (error) {
    console.error('[FCM] Error processing background message:', error);
  }
});

AppRegistry.registerComponent(appName, () => App);
