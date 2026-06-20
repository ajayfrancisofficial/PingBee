import { Model, Query } from '@nozbe/watermelondb';
import type Message from './Message';
import { field, children } from '@nozbe/watermelondb/decorators';

export default class Chat extends Model {
  static table = 'chats';
  static associations = {
    messages: { type: 'has_many' as const, foreignKey: 'chat_id' },
  };

  @field('name') name!: string;
  @field('type') type!: 'individual' | 'group';
  @field('unread_count') unreadCount!: number;
  @field('last_message_text') lastMessageText?: string;
  @field('last_updated_at') lastUpdatedAt!: number;
  @field('avatar_url') avatarUrl?: string;
  @field('last_message_sent_username') lastMessageSentUsername?: string;

  @children('messages') messages!: Query<Message>;
}
