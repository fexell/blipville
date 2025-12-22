import { Router } from 'express'
import multer from 'multer'

import Logger from '../../configs/Logger.config.js'

import CsrfRouter from './Csrf/Csrf.route.js'
import UserRouter from './User/User.route.js'
import AuthRouter from './Auth/Auth.route.js'
import ChatRouter from './Chat/Chat.route.js'

const ApiRouter                             = Router()

// CSRF Router
ApiRouter.use( '/csrf', CsrfRouter )

// User Router
ApiRouter.use( '/user', [ multer().none() ], UserRouter )

// Auth Router
ApiRouter.use( '/auth', [ multer().none() ], AuthRouter )

// Chat Router
ApiRouter.use( '/chat', [ multer().none() ], ChatRouter )

export {
  ApiRouter as default,
}
