import { useEffect } from 'react'
import { Outlet, Navigate } from 'react-router'

import useAuthStore from '../../auth/stores/Auth.store'

const MainLayout                            = () => {
  const userId                              = useAuthStore(( state ) => state.userId)
  
  if( !userId ) return <Navigate to='/login' />

  return (
    <>
      <Outlet />
    </>
  )
}

export default MainLayout
