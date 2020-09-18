import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver
} from 'type-graphql'
import { MyContext } from 'src/types'
import argon2 from 'argon2'
import { COOKIE_NAME } from '../constants'

import { User, UserModel } from '../entities/User'

@InputType()
class UserInput {
  @Field()
  email: string
  @Field()
  username: string
  @Field()
  password: string
}

@Resolver()
export class UserResolver {
  // Get Users
  @Query(() => [User])
  async users() {
    return await UserModel.find()
  }

  // Get User
  @Query(() => User, { nullable: true })
  async user(@Arg('id') id: string) {
    return await UserModel.findById(id)
  }

  // Me
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null
    }

    return await UserModel.findById(req.session.userId)
  }

  // Register
  @Mutation(() => User, { nullable: true })
  async register(
    @Arg('input') { email, username, password }: UserInput,
    @Ctx() { req }: MyContext
  ) {
    const existingUser = await UserModel.find({
      $or: [{ username }, { email }]
    })

    if (existingUser.length) {
      return null
    }

    const user = await UserModel.create({ email, username, password })
    await user.save()

    req.session.userId = user._id

    return user
  }

  // Login
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ) {
    const [user] = await UserModel.find({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    })

    if (!user) {
      return null
    }

    const isCorrectPassword = await argon2.verify(user.password, password)
    if (isCorrectPassword) {
      req.session.userId = user._id
      return user
    }

    return null
  }

  // Logout
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    return new Promise(resolve =>
      req.session.destroy(err => {
        res.clearCookie(COOKIE_NAME)

        if (err) {
          resolve(false)
          return
        }

        resolve(true)
      })
    )
  }
}
