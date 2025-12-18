import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore                         = create(
  persist(
    ( set ) => ({
      theme                                 : localStorage.getItem( 'theme' ) || 'light',
      setTheme                              : ( theme ) => set({ theme }),
    }),
    {
      name                                  : 'theme',
      getStorage                            : () => localStorage,
    }
  )
)

export default useThemeStore
