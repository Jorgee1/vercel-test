import React from 'react'
import { createRoot } from 'react-dom/client'


const App = () => {
    return <div className='main'>
        Hello from React
    </div>
}


const root = document.createElement('div')
document.body.replaceChildren()
document.body.appendChild(root)
createRoot(root).render(<App/>)