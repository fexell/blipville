import UserModel from '../models/User.model.js';
import ChatModel from '../models/Chat.model.js';

import UserHelper from '../helpers/User.helper.js';

class ChatController {
  static Init( io ) {
    return async ( req, res, next ) => {
      try {
        const user                          = await UserModel.findById( UserHelper.GetUserId( req, res, next ) );
        const { message } = req.body;
        const room = user.room;

        if( !room )
          return res.status(401).json({ success: false });
        
        await ChatModel.create({
          message,
          userId: user._id,
          username: user.username,
          room,
        });

        io.to( room ).emit( 'chatMessage', {
          id                                : user._id,
          username                          : user.username,
          message,
        } )

        res.status(201).json({ success: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
      }
    }
  }
}

export {
  ChatController as default,
}
