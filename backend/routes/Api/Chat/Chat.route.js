import { Router } from 'express'

import ChatController from '../../../controllers/Chat.controller.js'

import AuthMiddleware from '../../../middlewares/Auth.middleware.js'

const ChatRouter                            = Router()

ChatRouter.post( '/', [
  AuthMiddleware.ValidateTokens,
  AuthMiddleware.Authenticate,
  AuthMiddleware.VerifySessionData,
  AuthMiddleware.RefreshTokenRevoked,
  AuthMiddleware.EmailVerified,
  AuthMiddleware.AccountInactive,
], ChatController.Create )

export {
  ChatRouter as default,
}