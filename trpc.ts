import { initTRPC } from '@trpc/server'


const t = initTRPC.create()

export const appRouter = t.router({
    greeting: t.procedure
        .query(() => 'FROM TRPC'),
    roll: t.procedure
        .mutation(() => Math.floor(Math.random() *100))
})

export type AppRouter = typeof appRouter