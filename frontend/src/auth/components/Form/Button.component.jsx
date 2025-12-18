import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'

const AuthFormButtonComponent               = ({ buttonType, buttonText, isButtonDisabled }) => {
  return (
    <>
      <div>
        <div>
          <button
            className={
              clsx(
                'flex flex-row w-full justify-center p-4 mb-4 text-white rounded-full',
                'bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50',
                'shadow-2xl shadow-blue-600/50 dark:shadow-2xl dark:shadow-blue-600/50'
              )
            }
            type={ buttonType }
            disabled={ isButtonDisabled }>
              <span>{ buttonText }</span>
            </button>
        </div>
      </div>
    </>
  )
}

export default AuthFormButtonComponent
