import React, { useEffect, useState } from 'react';
import { type StaticScreenProps } from '@react-navigation/native';
import { useChatStore } from '../store/chatStore';
import { ChatBox } from '../components/chat/ChatBox';
import { ChatScreenHeader } from '../components/chat/ChatScreenHeader';
import { ImagePreviewModal } from '../components/common/ImagePreviewModal';
import { useChatOnlineStatus } from '../hooks/useChatOnlineStatus';
import { useClearChatNotifications } from '../hooks/useClearChatNotifications';

// ─── Screen ───────────────────────────────────────────────────────────────────

export type ChatScreenParams = {
  name: string;
  chatId: string;
  avatarUrl?: string;
  chatType?: 'individual' | 'group';
  otherUserId?: string;
};
type Props = StaticScreenProps<ChatScreenParams>;

const ChatScreen = ({ route }: Props) => {
  const {
    name,
    chatId,
    avatarUrl,
    chatType,
    otherUserId: routeOtherUserId,
  } = route.params;
  const setActiveChatId = useChatStore(s => s.setActiveChatId);

  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const { isOnline } = useChatOnlineStatus({
    chatId,
    chatType,
    routeOtherUserId,
  });

  // Clear notifications for this chat when opened
  useClearChatNotifications(chatId);

  // Register active chat (used by WebSocket routing)
  useEffect(() => {
    setActiveChatId(chatId);
    return () => setActiveChatId(null);
  }, [chatId, setActiveChatId]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ChatScreenHeader
        name={name}
        avatarUrl={avatarUrl}
        isOnline={isOnline}
        isLoading={isLoading}
        onAvatarPress={() => setIsPreviewVisible(true)}
      />
      <ChatBox chatId={chatId} onLoadingChange={setIsLoading} />
      <ImagePreviewModal
        visible={isPreviewVisible}
        imageUrl={avatarUrl}
        title={name}
        onClose={() => setIsPreviewVisible(false)}
      />
    </>
  );
};

export default ChatScreen;
