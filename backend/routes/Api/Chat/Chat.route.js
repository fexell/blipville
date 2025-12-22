import { Router } from 'express'

import ChatController from '../../../controllers/Chat.controller.js'

import AuthMiddleware from '../../../middlewares/Auth.middleware.js'

export default function Chat( io ) {
  const ChatRouter                            = Router()

  // Chat Router
  ChatRouter.post( '/', [], ChatController.Init( io ) )

  return ChatRouter
}
