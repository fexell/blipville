import { useEffect, useState } from 'react'

import { apiClient } from '../api/Axios.api'

const useCsrfToken                          = () => {
  const [ csrfToken, setCsrfToken ]         = useState(null)

  useEffect(() => {
    let isMounted                           = true

    async function fetchCsrfToken() {
      try {
        const response                      = await apiClient.get('/csrf')

        if ( isMounted ) {
          setCsrfToken(response.data.token)
        }
      } catch ( error ) {
        console.warn('Could not fetch CSRF token: ', error)
      }
    }

    fetchCsrfToken()

    return () => {
      isMounted                             = false
    }
  }, [])

  useEffect(() => {
    const interceptor                       = apiClient.interceptors.request.use(( config ) => {
      if ( csrfToken ) {
        config.headers[ 'x-csrf-token' ]    = csrfToken
      }

      return config
    })

    return () => {
      apiClient.interceptors.request.eject(interceptor)
    }
  }, [ csrfToken ])

  return csrfToken
}

export {
  useCsrfToken
}
