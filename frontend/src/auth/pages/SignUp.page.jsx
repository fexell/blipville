import { useState, useCallback } from 'react'
import { faAt, faCircleUser, faSignature, faLock } from '@fortawesome/free-solid-svg-icons'

import AuthLayout from '../layouts/Auth.layout'

import AuthFormComponent from '../components/Form/Form.component'
import AuthFormInputComponent from '../components/Form/Input.component'
import AuthFormErrorComponent from '../components/Form/Error.component'
import AuthFormSuccessComponent from '../components/Form/Success.component'

import { apiClient } from '../api/Axios.api'

import useAsyncStatus from '../hooks/useAsyncStatus.hook'

import SignUpImage from '../assets/images/SignUp.svg'

const SignUpPage                            = () => {

  /* eslint-disable no-unused-vars */
  const {
    loading,
    successMessage,
    errorMessage,
    run,
  }                                         = useAsyncStatus()
  
  const [ formData, setFormData ]           = useState({
    email                                   : '',
    username                                : '',
    forename                                : '',
    surname                                 : '',
    password                                : '',
    passwordConfirm                         : '',
  })

  const handleSignUp                        = useCallback( async ( e ) => {
    e.preventDefault()

    const data                              = new FormData()
    data.append( 'email', formData.email )
    data.append( 'username', formData.username )
    data.append( 'forename', formData.forename )
    data.append( 'surname', formData.surname )
    data.append( 'password', formData.password )
    data.append( 'passwordConfirm', formData.passwordConfirm )

    await run( apiClient.post( '/user', data ) )
  }, [ formData, run ] )

  return (
    <>
      <title>Sign up</title>
      <AuthLayout
        isRedirect={ true }
        title='Sign up'
        subtitle='Fill in the form to sign up'
        footerText='Already have an account?'
        footerLinkTo='/login'
        footerLinkText='Log in.'
        image={ SignUpImage }>
        <AuthFormComponent
          submitFn={ handleSignUp }
          buttonType='submit'
          buttonText='Sign up'
          formData={ formData }
          setFormData={ setFormData }>
          <AuthFormInputComponent
            type='text'
            name='email'
            placeholder='Email'
            title='Email'
            icon={ faAt }
            required={ true }
            regexp={ /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i }
            isRemember={ true } />
          <AuthFormInputComponent
            type='text'
            name='username'
            placeholder='Username'
            title='Username'
            icon={ faCircleUser }
            required={ true }
            regexp={ /^[a-zåäö0-9_]{3,16}$/i }
            explanation='Username must be between 3 and 16 characters' />
          <AuthFormInputComponent
            type='text'
            name='forename'
            placeholder='Forename'
            title='Forename'
            icon={ faSignature }
            required={ true }
            regexp={ /^[a-zåäö]{3,16}$/i } />
          <AuthFormInputComponent
            type='text'
            name='surname'
            placeholder='Surname'
            title='Surname'
            icon={ faSignature }
            required={ true }
            regexp={ /^[a-zåäö]{3,16}$/i } />
          <AuthFormInputComponent
            type='password'
            name='password'
            placeholder='Password'
            title='Password'
            icon={ faLock }
            required={ true }
            regexp={ /^.{6,}$/ }
            explanation='Password must be at least 6 characters' />
          <AuthFormInputComponent
            type='password'
            name='passwordConfirm'
            placeholder='Confirm password'
            title='Confirm password'
            icon={ faLock }
            required={ true }
            regexp={ /^.{6,}$/ }
            equals='password' />
          <AuthFormErrorComponent errorMessage={ errorMessage } />
          <AuthFormSuccessComponent successMessage={ successMessage } />
        </AuthFormComponent>
      </AuthLayout>
    </>
  )
}

export default SignUpPage
