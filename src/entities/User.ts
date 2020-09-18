import { ObjectType, Field, ID } from 'type-graphql'
import { prop as Property, getModelForClass } from '@typegoose/typegoose'

@ObjectType()
export class User {
  @Field(() => ID)
  id: number

  @Field()
  @Property({ unique: true })
  username!: string

  @Field()
  @Property({ unique: true })
  email!: string

  @Field()
  @Property()
  password!: string

  @Field()
  @Property({ default: new Date() })
  createdAt?: Date
}

export const UserModel = getModelForClass(User)
