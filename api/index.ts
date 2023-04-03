export const config = {
    runtime: 'edge'
}
  
  
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { initTRPC } from '@trpc/server'


const t = initTRPC.create()

const appRouter = t.router({
    greeting: t.procedure
        .query(() => 'FROM TRPC')
})


export default function handler(req: Request) {
    return fetchRequestHandler({
        endpoint: '/trpc',
        req: req,
        router: appRouter,
        createContext: () => ({})
    })
}
