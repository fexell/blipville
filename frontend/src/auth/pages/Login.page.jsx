import { useState, useCallback } from 'react'
import { useCookies } from 'react-cookie'
import { faAt, faLock } from '@fortawesome/free-solid-svg-icons'

import AuthLayout from '../layouts/Auth.layout'

import useAuthStore from '../stores/Auth.store'

import AuthFormComponent from '../components/Form/Form.component'
import AuthFormInputComponent from '../components/Form/Input.component'
import AuthFormErrorComponent from '../components/Form/Error.component'

import { apiClient } from '../api/Axios.api'

import useAsyncStatus from '../hooks/useAsyncStatus.hook'

import LoginImage from '../assets/images/Login.svg'

const emailRegexp                           = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i

const LoginPage                             = () => {

  // Get cookies
  const [ cookies, ]                        = useCookies( [ 'userId' ] )

  // Get auth store states
  const { clearUserId }                     = useAuthStore()
  const setUserId                           = useAuthStore( ( state ) => state.setUserId )

  /* eslint-disable no-unused-vars */
  const {
    loading,
    successMessage,
    errorMessage,
    run,
  }                                         = useAsyncStatus()

  // State for holding form data
  const [ formData, setFormData ]           = useState({
    email                                   : '',
    password                                : '',
  })

  // Handle login
  const handleLogin                         = useCallback( async ( e ) => {
    e.preventDefault()

    // Clear user id, if it's already set
    if( cookies.userId || cookies.userId === null ) {
      clearUserId()
    }

    // Bind form data
    const data                              = new FormData()
    data.append( 'email', formData.email )
    data.append( 'password', formData.password )

    // Run request
    const response                          = await run( apiClient.post( '/auth/login', data ) )

    // Set user id
    if( response.status === 200 ) {
      setUserId( response.data.user.id )
    }
  }, [ cookies, clearUserId, formData, run, setUserId ] )

  return (
    <>
      <title>Login</title>
      <AuthLayout
        isRedirect={ true }
        title='Welcome back!'
        subtitle='Fill in the form to log in'
        footerText="Don't have an account?"
        footerLinkTo='/signup'
        footerLinkText='Sign up.'
        image={ LoginImage }>
        <AuthFormComponent
          submitFn={ handleLogin }
          buttonType='submit'
          buttonText='Login'
          formData={ formData }
          setFormData={ setFormData }>
          <AuthFormInputComponent
            name='email'
            type='email'
            placeholder='Email'
            title='Email'
            icon={ faAt }
            required={ true }
            inputMode='email'
            regexp={ emailRegexp }
            isRemember={ true } />
          <AuthFormInputComponent
            name='password'
            type='password'
            placeholder='Password'
            title='Password'
            icon={ faLock }
            required={ true }
            regexp={ /^.{6,}$/ }
            explanation='Password must be at least 6 characters' />
          <AuthFormErrorComponent
            errorMessage={ errorMessage } />
        </AuthFormComponent>
      </AuthLayout>
    </>
  )
}

export default LoginPage
