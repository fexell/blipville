import { useState } from 'react'

import AuthFormButtonComponent from './Button.component'

import { FormContext } from '../../contexts/Auth.context'

const AuthFormComponent                     = ({
  children,
  submitFn,
  buttonType,
  buttonText,
  formData,
  setFormData,
}) => {
  const [ validity, setValidity ]           = useState({})

  return (
    <>
      <FormContext.Provider value={{ formData, setFormData, validity, setValidity }}>
        <div>
          <div>
            <form onSubmit={ submitFn }>
              <div>
                { children }
                <AuthFormButtonComponent
                  buttonType={ buttonType }
                  buttonText={ buttonText }
                  isButtonDisabled={ !Object.values( validity ).every( Boolean ) } />
                <hr className='w-[80%] mt-6 mb-4 mx-auto text-neutral-300 dark:text-neutral-600' />
              </div>
            </form>
          </div>
        </div>
      </FormContext.Provider>
    </>
  )
}

export default AuthFormComponent
