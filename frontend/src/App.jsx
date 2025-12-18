import { useEffect } from 'react'
import { useNavigate, Routes, Route } from 'react-router'
import { ToastContainer } from 'react-toastify'

import MainLayout from './shared/layouts/Main.layout'

import HomePage from './home/pages/Home.page'

import LoginPage from './auth/pages/Login.page'
import SignUpPage from './auth/pages/Signup.page'
import VerifyEmailPage from './auth/pages/VerifyEmail.page'

import { useCsrfToken } from './auth/hooks/useCsrfToken.hook'

import useAuthStore from './auth/stores/Auth.store'
import useThemeStore from './auth/stores/Theme.store'

import './App.css'

const App                                   = () => {
  useCsrfToken()

  const navigate                            = useNavigate()

  const {
    theme,
    setTheme
  }                                         = useThemeStore()
  const userId                              = useAuthStore(( state ) => state.userId)

  useEffect(() => {
    const theme                             = JSON.parse( localStorage.getItem( 'theme' ) )

    if( theme && theme.state.theme ) setTheme( theme.state.theme )
    else
      if( window.matchMedia( '(prefers-color-scheme: dark)' ).matches && theme === 'light' )
        setTheme( 'dark' )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <main
        className={ `${ theme }` }>
        <div>
          <Routes>
            <Route element={ <MainLayout /> }>
              <Route path='/' element={ <HomePage /> } />
            </Route>

            <Route path='/login' element={ <LoginPage /> } />
            <Route path='/signup' element={ <SignUpPage /> } />
            <Route path='/email/verify/:token' element={ <VerifyEmailPage /> } />
          </Routes>
          <ToastContainer theme={ theme === 'light' ? 'light' : 'dark' } />
        </div>
      </main>
    </>
  )
}

export default App
