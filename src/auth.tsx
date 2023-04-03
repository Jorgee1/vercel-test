import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'

const authParams = {
    isAuthed: false,
    logIn: () => {},
    logOut: () => {}
}
const authContext = React.createContext(authParams)

export const useAuthContext = () => React.useContext(authContext)

export const AuthProvider = ({children}: {children: React.ReactElement}) => {
    const localAuthed = window.localStorage.getItem('isAuthed')
    const [isAuthed, setAuth] = React.useState(localAuthed === 't')

    const logIn = () => {
        window.localStorage.setItem('isAuthed', 't')
        setAuth(true)
    }
    const logOut = () => {
        window.localStorage.setItem('isAuthed', 'f')
        setAuth(false)
    }

    return <authContext.Provider value={{isAuthed, logIn, logOut}}>{children}</authContext.Provider>
}

export const ProtectedRoute = () => {
    const {isAuthed} = useAuthContext()
    return isAuthed ? <Outlet/> : <Navigate to='/login'/>
}