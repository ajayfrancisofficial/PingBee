import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export default class User extends Model {
  static table = 'users'

  @field('name') name!: string
  @field('avatar_url') avatarUrl!: string
  @field('phone_number') phoneNumber!: string
}
