import { Model, Relation } from '@nozbe/watermelondb';
import type Chat from './Chat';
import { field, immutableRelation } from '@nozbe/watermelondb/decorators';

export default class Message extends Model {
  static table = 'messages';
  static associations = {
    chats: { type: 'belongs_to' as const, key: 'chat_id' },
  };

  @field('chat_id') chatId!: string;
  @field('sender_id') senderId!: string;
  @field('text') text!: string;
  @field('media_url') mediaUrl?: string;
  @field('media_type') mediaType?: 'image' | 'video' | 'file';
  @field('status') status!: 'pending' | 'sent' | 'delivered' | 'read';
  @field('is_mine') isMine!: boolean;
  @field('reply_to_id') replyToId?: string;
  @field('is_edited') isEdited!: boolean;
  @field('edited_at') editedAt?: number;
  @field('edit_status') editStatus?: 'pending' | 'synced';
  @field('is_deleted_for_everyone') isDeletedForEveryone!: boolean;
  @field('deleted_for_everyone_at') deletedForEveryoneAt?: number;
  @field('delete_status') deleteStatus?: 'pending' | 'synced';
  @field('is_deleted_for_me') isDeletedForMe!: boolean;
  @field('deleted_for_me_at') deletedForMeAt!: number | null;
  @field('created_time') createdAt!: number;
  @field('server_timestamp') serverTimestamp?: number;

  @immutableRelation('chats', 'chat_id') chat!: Relation<Chat>;

  /** Whether the message can still be edited (within 15 mins and not deleted) */
  get isEditable(): boolean {
    const fifteenMins = 15 * 60 * 1000;
    const now = Date.now();
    return (
      this.isMine &&
      !this.isDeletedForEveryone &&
      !this.isDeletedForMe &&
      now - this.createdAt < fifteenMins
    );
  }

  /** Whether the message can still be deleted (no time limit, only requires ownership) */
  get isDeletable(): boolean {
    return this.isMine;
  }
}
