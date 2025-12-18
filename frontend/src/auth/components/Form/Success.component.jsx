

const AuthFormSuccessComponent              = ({ successMessage }) => {
  return (
    <>
      { successMessage && (
        <div className='block p-4 rounded-full mb-4 bg-green-200'>
          <div>
            <p className='block text-center text-green-600'>{ successMessage || 'Success' }</p>
          </div>
        </div>
      ) }
    </>
  )
}

export default AuthFormSuccessComponent
