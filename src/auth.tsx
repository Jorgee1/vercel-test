import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'

const authParams = {
    isAuthed: false,
    logIn: () => {},
    logOut: () => {}
}
const authContext = React.createContext(authParams)

export const useAuthContext = () => React.useContext(authContext)

export const AuthProvider = ({children}) => {
    const [isAuthed, setAuth] = React.useState(false)

    const logIn = () => {
        setAuth(true)
    }
    const logOut = () => {
        setAuth(false)
    }

    return <authContext.Provider value={{isAuthed, logIn, logOut}}>{children}</authContext.Provider>
}

export const ProtectedRoute = () => {
    const {isAuthed} = useAuthContext()
    return isAuthed ? <Outlet/> : <Navigate to='/login'/>
}