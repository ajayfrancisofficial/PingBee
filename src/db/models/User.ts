import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export default class User extends Model {
  static table = 'users'

  @field('name') name!: string
  @field('username') username?: string
  @field('first_name') firstName?: string
  @field('last_name') lastName?: string
  @field('email') email?: string
  @field('avatar_url') avatarUrl?: string
  @field('phone_number') phoneNumber?: string

  /** Returns the best display name available */
  get displayName(): string {
    const full = [this.firstName, this.lastName].filter(Boolean).join(' ');
    return full || this.username || this.name || 'Unknown';
  }
}
