import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'username', type: 'string', isOptional: true },
        { name: 'first_name', type: 'string', isOptional: true },
        { name: 'last_name', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'avatar_url', type: 'string', isOptional: true },
        {
          name: 'phone_number',
          type: 'string',
          isIndexed: true,
          isOptional: true,
        },
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
        { name: 'avatar_url', type: 'string', isOptional: true },
        {
          name: 'last_message_sent_username',
          type: 'string',
          isOptional: true,
        },
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
        { name: 'is_edited', type: 'boolean' },
        { name: 'edited_at', type: 'number', isOptional: true },
        { name: 'edit_status', type: 'string', isOptional: true },
        { name: 'is_deleted_for_everyone', type: 'boolean' },
        { name: 'deleted_for_everyone_at', type: 'number', isOptional: true },
        { name: 'delete_status', type: 'string', isOptional: true },
        { name: 'is_deleted_for_me', type: 'boolean' },
        { name: 'deleted_for_me_at', type: 'number', isOptional: true },
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
