import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'avatar_url', type: 'string' },
        { name: 'phone_number', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'chats',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' }, // 'individual' | 'group'
        { name: 'last_message_text', type: 'string', isOptional: true },
        { name: 'unread_count', type: 'number' },
        { name: 'updated_at', type: 'number', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'messages',
      columns: [
        { name: 'chat_id', type: 'string', isIndexed: true },
        { name: 'sender_id', type: 'string', isIndexed: true },
        { name: 'text', type: 'string' },
        { name: 'media_url', type: 'string', isOptional: true },
        { name: 'media_type', type: 'string', isOptional: true }, // 'image' | 'video' | 'file'
        { name: 'status', type: 'string', isIndexed: true }, // 'pending' | 'sent' | 'delivered' | 'read'
        { name: 'created_at', type: 'number', isIndexed: true },
        { name: 'server_timestamp', type: 'number', isOptional: true },
        { name: 'is_mine', type: 'boolean' },
        { name: 'reply_to_id', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'chat_participants',
      columns: [
        { name: 'chat_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
      ],
    }),
  ],
});
