import { create } from 'zustand'
import Cookies from 'universal-cookie'

const useAuthStore                          = create(( set ) => {
  const cookies                             = new Cookies()

  return {
    userId                                  : cookies.get( 'userId' ) ?? null,
    setUserId                               : ( userId ) => set({ userId }),
    clearUserId                             : () => set({ userId: null }),
  }
})

export default useAuthStore
