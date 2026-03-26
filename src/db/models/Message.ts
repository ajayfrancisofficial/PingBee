import { Model } from '@nozbe/watermelondb'
import { field, date, immutableRelation } from '@nozbe/watermelondb/decorators'

export default class Message extends Model {
  static table = 'messages'
  static associations = {
    chats: { type: 'belongs_to' as const, key: 'chat_id' },
  }

  @field('chat_id') chatId!: string
  @field('sender_id') senderId!: string
  @field('text') text!: string
  @field('media_url') mediaUrl?: string
  @field('media_type') mediaType?: 'image' | 'video' | 'file'
  @field('status') status!: 'pending' | 'sent' | 'delivered' | 'read'
  @field('is_mine') isMine!: boolean
  @date('created_at') createdAt!: number
  @field('server_timestamp') serverTimestamp?: number

  @immutableRelation('chats', 'chat_id') chat: any
}
