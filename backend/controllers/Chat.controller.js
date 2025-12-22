import { saveChat } from "../services/Chat.service.js";

class ChatController {
  static async Create( req, res, next ) {
    try {
      const { message } = req.body;
      const room = req.user.room;
      
      await saveChat({
        message,
        userId: req.user._id,
        username: req.user.username,
        room,
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  }
}

export {
  ChatController as default,
}
