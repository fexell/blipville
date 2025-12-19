import React from 'react'
import { Navigate } from 'react-router'

import Game from '../components/Game'

import useAuthStore from '../../auth/stores/Auth.store'

import { apiClient } from '../../auth/api/Axios.api'

import useAsyncStatus from '../../auth/hooks/useAsyncStatus.hook'

class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}

const HomePage                              = () => {
  const { userId, clearUserId }                     = useAuthStore()
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
      <div className=''>
        { userId && (
          <ErrorBoundary>
            <Game onLogout={handleLogout} level="forest" />
          </ErrorBoundary>
        ) }
      </div>
    </>
  )
}

export default HomePage
