import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { initTRPC } from '@trpc/server'

const t = initTRPC.create()

const appRouter = t.router({
    greeting: t.procedure
        .query(() => 'FROM TRPC')
})


addEventListener('fetch', (event) => {
    return event.respondWith(fetchRequestHandler({
        endpoint: '/trpc',
        req: event.request,
        router: appRouter,
        createContext: () => ({})
    }))
})
