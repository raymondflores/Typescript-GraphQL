import 'reflect-metadata'
import Express from 'express'
import session from 'express-session'

import { connect } from 'mongoose'
import connectMongo from 'connect-mongo'
const MongoStore = connectMongo(session)

import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/User'

import { COOKIE_NAME } from './constants'

const main = async () => {
  // create mongoose connection
  const mongoose = await connect(
    'mongodb+srv://raymond:eUYFXRHm05IkgJkf@node-shop-vkcd5.mongodb.net/ironman',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )

  const app = Express()

  app.use(
    session({
      name: COOKIE_NAME,
      store: new MongoStore({
        mongooseConnection: mongoose.connection
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: false // only works in https
      },
      saveUninitialized: false,
      secret: 'keyboard cat',
      resave: false
    })
  )

  const schema = await buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: true,
    validate: false
  })

  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res })
  })

  server.applyMiddleware({ app, cors: false })

  app.listen({ port: 4000 }, async () => {
    console.log(
      `🚀 Server ready and listening at ==> http://localhost:4000${server.graphqlPath}`
    )
  })
}

main().catch(error => {
  console.log(error, 'error')
})
