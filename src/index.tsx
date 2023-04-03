import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, ProtectedRoute, useAuthContext } from './auth'


const Nav = () => {
    const { logOut } = useAuthContext()
    const click = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        logOut()
    }


    return <nav>
        <Link to='/'>Home</Link>
        <Link to='/2'>Second</Link>
        <a href="#" onClick={click}>LogOut</a>
    </nav>
}

const Home = () => {
    return <div className='main'>
        <h1>Protected View</h1>
        <Nav/>
        <div>
            <h3>Content</h3>
        </div>
    </div>
}

const Home2 = () => {
    return <div className='main'>
        <h1>Protected View 2</h1>
        <Nav/>
        <div>
            <h3>Content</h3>
        </div>
    </div>
}


const LogIn = () => {
    const navigate = useNavigate()
    const { isAuthed, logIn } = useAuthContext()

    const click = () => {
        logIn()
    }

    React.useEffect(() => {
        if (isAuthed) navigate('/')
    }, [isAuthed])

    return <div className='login'>
        <h1>LogIn</h1>
        <button onClick={click}>LogIn</button>
    </div>
}

const App = () => {

    const router = createBrowserRouter([
        {
            path: '/',
            element: <ProtectedRoute/>,
            children: [
                {
                    path: '/',
                    element: <Home/>
                },
                {
                    path: '/2',
                    element: <Home2/>
                },
            ]
        },
        {
            path: '/login',
            element: <LogIn/>
        }
    ])


    return <>
        <AuthProvider>
            <RouterProvider router={router}/>
        </AuthProvider>
    </>
}


const root = document.createElement('div')
document.body.replaceChildren()
document.body.appendChild(root)
createRoot(root).render(<App/>)