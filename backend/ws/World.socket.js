import cookie from 'cookie'
import cookieParser from 'cookie-parser'

import CookieHelper from '../helpers/Cookie.helper.js'

import UserModel from '../models/User.model.js'

export default function worldSocket(io) {
  const players = {}

  io.use(( socket, next ) => {
    try {
      const header                          = socket.request.headers.cookie
      if( !header ) return next( new Error('No cookie') )

      const cookies                         = cookie.parse( header )

      socket.request.cookies                = cookies

      let signedUserId                      = cookieParser.signedCookie(
        cookies.userId,
        process.env.COOKIE_SECRET,
      )

      if( typeof signedUserId === 'string' && signedUserId.startsWith( 'j:' ) )
        signedUserId                        = JSON.parse( signedUserId.slice( 2 ) )

      if( !signedUserId ) return next( new Error('No signed cookie') )

      socket.userId                         = signedUserId

      next()
    } catch ( error ) {
      next( error )
    }
  })

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)
    console.log('USER ID: ', socket.userId)

    socket.on('joinRoom', async ({ room }) => {
      socket.join(room)

      const user                            = await UserModel.findById( socket.userId )
      if( !user ) return

      user.room                             = room
      user.lastSeen                         = Date.now()
      await user.save()

      const players                         = await UserModel.find({ room })

      socket.emit( 'localUser', {
        id                                  : user._id.toString(),
      } )
      
      socket.emit( 'initPlayers', players.map( UserModel.SerializeUser ) )

      socket.to( room ).emit( 'playerJoined', UserModel.SerializeUser( user ) )
    })

    socket.on('move', async ({ x, y }) => {
      const user                            = await UserModel.findById( socket.userId )
      if( !user ) return

      user.position                         = { x, y }
      await user.save()

      io.to( user.room ).emit( 'playerMoved', { id: user._id, x, y } )
    })

    socket.on('chat', async ({ message }) => {
      const user                            = await UserModel.findById( socket.userId )
      if( !user ) return

      io.to( user.room ).emit( 'chatMessage', {
        id                                  : user._id.toString(),
        username                            : user.username,
        message,
      } )
    })

    socket.on('disconnect', async () => {
      const user                            = await UserModel.findById( socket.userId )
      if( user ) {
        io.to( user.room ).emit( 'playerLeft', { id: user._id } )
        user.lastSeen                       = Date.now()
        await user.save()
      }

      console.log('Socket disconnected:', socket.id)
    })
  })
}
