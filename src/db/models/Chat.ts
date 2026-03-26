import { Model } from '@nozbe/watermelondb'
import { field, date, children, lazy } from '@nozbe/watermelondb/decorators'

export default class Chat extends Model {
  static table = 'chats'
  static associations = {
    messages: { type: 'has_many' as const, foreignKey: 'chat_id' },
  }

  @field('name') name?: string
  @field('type') type!: 'individual' | 'group'
  @field('unread_count') unreadCount!: number
  @field('last_message_id') lastMessageId?: string
  @date('updated_at') updatedAt!: number

  @children('messages') messages!: any

  @lazy
  lastMessage = this.collections.get('messages').find(this.lastMessageId!)
}
