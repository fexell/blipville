import { createContext } from 'react'
import Cookies from 'universal-cookie'

const cookies                               = new Cookies()

export const FormContext                    = createContext( null )
export const UserIdContext                  = createContext( cookies.get( 'userId' ) ?? null )