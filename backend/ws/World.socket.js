import cookie from 'cookie'
import cookieParser from 'cookie-parser'

import ChatModel from '../models/Chat.model.js'
import UserModel from '../models/User.model.js'

import { saveChat } from '../services/Chat.service.js'

export default function worldSocket(io) {
  const players                             = {}
  const activeSockets                       = {}

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

    const userId                            = socket.userId
    if( !userId ) return

    if( !activeSockets[ userId ] )
      activeSockets[ userId ] = new Set()

    activeSockets[ userId ].add( socket )

    socket.on('leaveRoom', async ({ room }) => {
      socket.leave(room);

      // Optionally notify others in that room that the player left
      io.to(room).emit('playerLeft', { id: socket.userId });

      // Update user's room in DB
      const user = await UserModel.findById(socket.userId);
      if (user) {
        user.room = null; // or some default
        await user.save();
      }

      console.log(`${socket.userId} left room ${room}`);
    });

    socket.on('joinRoom', async ({ room }) => {
      if( !socket.userId ) return

      const previousRoom = socket.currentRoom;
      if (previousRoom && previousRoom !== room) {
        socket.leave(previousRoom);
        io.to(previousRoom).emit('playerLeft', { id: socket.userId });
      }

      socket.join(room);
      socket.currentRoom = room;

      const user = await UserModel.findById(socket.userId);
      if (!user) return;

      user.room = room;
      user.lastSeen = Date.now();
      await user.save();

      const playersInRoom = await UserModel.find({ room });

      // Notify self
      socket.emit('localUser', { id: user._id.toString() });
      socket.emit('initPlayers', playersInRoom.map(UserModel.SerializeUser));

      // Notify others
      socket.to(room).emit('playerJoined', UserModel.SerializeUser(user));
    });

    socket.on('move', async ({ x, y }) => {
      const user = await UserModel.findById(socket.userId);
      if (!user || !user.room) return;

      user.position = { x, y };
      await user.save();

      io.to(user.room).emit('playerMoved', { id: user._id, x, y });
    });

    socket.on('chat', async ({ message }) => {
      const user = await UserModel.findById(socket.userId);
      if (!user || !user.room) return;

      await saveChat({
        message,
        userId: user._id,
        username: user.username,
        room: user.room,
      });

      io.to(user.room).emit('chatMessage', {
        id: user._id.toString(),
        username: user.username,
        message,
      });
    });

    socket.on('typing', ({ typing }) => {
      const room = socket.currentRoom;
      if (!room) return;

      socket.emit('playerTyping', { id: socket.userId, typing });           // to sender
      socket.to(room).emit('playerTyping', { id: socket.userId, typing }); // to others in room
    });

    socket.on('initChats', async () => {
      const user                            = await UserModel.findById( socket.userId )
      if( !user ) return

      const history                         = await ChatModel.find({ room: user.room })
        .sort({ createdAt: -1 })
        .limit( 25 )

      socket.emit('chatHistory', history)
    });

    socket.on('disconnect', async () => {
      activeSockets[ socket.userId ].delete( socket.id )

      if( activeSockets[ userId ].size === 0 ) {
        const user                            = await UserModel.findById( socket.userId )
        if( user ) {
          io.to( user.room ).emit( 'playerLeft', { id: user._id } )
          user.lastSeen                       = Date.now()
          user.room                           = null
          await user.save()
        }

        delete activeSockets[ userId ]
      }

      console.log('Socket disconnected:', socket.id)
    })
  })
}
