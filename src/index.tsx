import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, ProtectedRoute, useAuthContext } from './auth'
import type { AppRouter } from '../trpc'
import { createTRPCReact, httpBatchLink } from '@trpc/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const trpc = createTRPCReact<AppRouter>()

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
    const [currentRoll, setRoll] = React.useState(0)
    const [isDisabled, setEnable] = React.useState(false)
    const rollMutation = trpc.roll.useMutation({
        onSuccess: (result) => {
            setRoll(result)
            setEnable(false)
        }
    })

    const click = () => {
        rollMutation.mutate()
        setEnable(true)
    }

    return <div className='main'>
        <h1>Protected View</h1>
        <Nav/>
        <div className='center-text'>
            <h3>Content</h3>
            <button onClick={click} disabled={isDisabled}>Do a Barrerl Roll</button>
            <div>Roll: {currentRoll}</div>
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
    const [queryClient] = React.useState(() => new QueryClient())
    const [trpcClient] = React.useState(() => trpc.createClient({
        links: [httpBatchLink({url: 'https://vercel-test-henna.vercel.app/api'})]
    }))

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
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RouterProvider router={router}/>
                </AuthProvider>
            </QueryClientProvider>
        </trpc.Provider>
    </>
}


const root = document.createElement('div')
document.body.replaceChildren()
document.body.appendChild(root)
createRoot(root).render(<App/>)