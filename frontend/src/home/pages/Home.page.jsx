
import Game from '../components/Game'

import useAuthStore from '../../auth/stores/Auth.store'

import { apiClient } from '../../auth/api/Axios.api'

import useAsyncStatus from '../../auth/hooks/useAsyncStatus.hook'

const HomePage                              = () => {
  const { clearUserId }                     = useAuthStore()
  const { run }                             = useAsyncStatus()

  const handleLogout                        = async () => {
    try {
      await run( apiClient.post( '/auth/logout' ) )

      clearUserId()
    } catch ( error ) {
      console.warn(error)
    }
  }

  return (
    <>
      <div className='p-4'>
        <Game />
        <button className='absolute top-4 right-4' onClick={ handleLogout }>Logout</button>
      </div>
    </>
  )
}

export default HomePage
