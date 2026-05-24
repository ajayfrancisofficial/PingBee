import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export default class ChatParticipant extends Model {
  static table = 'chat_participants'
  static associations = {
    chats: { type: 'belongs_to' as const, key: 'chat_id' },
    users: { type: 'belongs_to' as const, key: 'user_id' },
  }

  @field('chat_id') chatId!: string
  @field('user_id') userId!: string
}
