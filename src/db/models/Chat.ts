import { Model, Query } from '@nozbe/watermelondb'
import type Message from './Message'
import { field, date, children, lazy } from '@nozbe/watermelondb/decorators'

export default class Chat extends Model {
  static table = 'chats'
  static associations = {
    messages: { type: 'has_many' as const, foreignKey: 'chat_id' },
  }

  @field('name') name!: string
  @field('type') type!: 'individual' | 'group'
  @field('unread_count') unreadCount!: number
  @field('last_message_text') lastMessageText?: string
  @date('updated_at') updatedAt!: number
  @field('avatar_url') avatarUrl?: string

  @children('messages') messages!: Query<Message>
}
