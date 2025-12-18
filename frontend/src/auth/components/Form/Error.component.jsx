

const AuthFormErrorComponent                = ({ errorMessage }) => {
  return (
    <>
      { errorMessage && (
        <div className='block p-4 rounded-full mb-4 bg-red-200'>
          <div>
            <p className='block text-center text-red-600'>{ errorMessage || 'Error occured' }</p>
          </div>
        </div>
      ) }
    </>
  )
}

export default AuthFormErrorComponent
