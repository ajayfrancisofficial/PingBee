import { Model, Relation } from '@nozbe/watermelondb'
import type Chat from './Chat'
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
  @field('reply_to_id') replyToId?: string
  @field('is_edited') isEdited!: boolean
  @field('edited_at') editedAt?: number
  @field('edit_status') editStatus?: 'pending' | 'synced'
  @field('is_deleted') isDeleted!: boolean
  @field('deleted_at') deletedAt?: number
  @field('delete_type') deleteType?: 'deleteForEveryone' | 'deleteForMe'
  @field('delete_status') deleteStatus?: 'pending' | 'synced'
  @field('is_deleted_for_me') isDeletedForMe!: boolean
  @date('created_at') createdAt!: number
  @field('server_timestamp') serverTimestamp?: number

  @immutableRelation('chats', 'chat_id') chat!: Relation<Chat>

  /** Whether the message can still be edited (within 15 mins and not deleted) */
  get isEditable(): boolean {
    const fifteenMins = 15 * 60 * 1000;
    const now = Date.now();
    return this.isMine && !this.isDeleted && (now - this.createdAt < fifteenMins);
  }

  /** Whether the message can still be deleted (within 1 hour) */
  get isDeletable(): boolean {
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();
    return this.isMine && (now - this.createdAt < oneHour);
  }
}
