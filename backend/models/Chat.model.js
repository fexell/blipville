import mongoose, { Schema } from 'mongoose'

const ChatSchema                            = new Schema({
  userId                                    : {
    type                                    : Schema.Types.ObjectId,
    required                                : true,
  },
  username                                  : {
    type                                    : String,
    required                                : true,
  },
  room                                      : {
    type                                    : String,
    required                                : true,
  },
  message                                   : {
    type                                    : String,
    required                                : true,
  },
}, {
  timestamps                                : true,
})

export default mongoose.model( 'Chat', ChatSchema )