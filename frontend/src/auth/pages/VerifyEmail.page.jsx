import { useState } from 'react'
import { useParams } from 'react-router'
import { faSquareBinary } from '@fortawesome/free-solid-svg-icons'

import AuthLayout from '../layouts/Auth.layout'

import AuthFormComponent from '../components/Form/Form.component'
import AuthFormInputComponent from '../components/Form/Input.component'
import AuthFormSuccessComponent from '../components/Form/Success.component'
import AuthFormErrorComponent from '../components/Form/Error.component'

import { apiClient } from '../api/Axios.api'

import useAsyncStatus from '../hooks/useAsyncStatus.hook'

import VerifyEmailImage from '../assets/images/EmailVerification.svg'

const VerifyEmailPage                       = () => {
  const { token }                           = useParams()

  /* eslint-disable no-unused-vars */
  const {
    loading,
    successMessage,
    errorMessage,
    run,
  }                                         = useAsyncStatus()
  const [ formData, setFormData ]           = useState({
    token                                   : token || '',
  })

  const handleVerify                        = async ( e ) => {
    e.preventDefault()

    await run( apiClient.put( `/auth/email/verify/${ token }` ) )
  }

  return (
    <>
      <title>Verify your email</title>
      <AuthLayout
        title='Verify your email'
        subtitle='Please check your email to verify your account.'
        footerText='Already verified?'
        footerLinkTo='/login'
        footerLinkText='Log in.'
        image={ VerifyEmailImage }>
          <AuthFormComponent
            submitFn={ handleVerify }
            buttonType='submit'
            buttonText='Verify'
            formData={ formData }
            setFormData={ setFormData }>
            <AuthFormInputComponent
              type='text'
              name='token'
              placeholder='Token'
              title='Token'
              icon={ faSquareBinary }
              required={ true }
              isDisabled={ true } />
            <AuthFormErrorComponent errorMessage={ errorMessage } />
            <AuthFormSuccessComponent successMessage={ successMessage } />
          </AuthFormComponent>
        </AuthLayout>
    </>
  )
}

export default VerifyEmailPage
