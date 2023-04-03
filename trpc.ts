import { randomBytes } from 'crypto'
import { initTRPC } from '@trpc/server'


const t = initTRPC.create()

export const appRouter = t.router({
    greeting: t.procedure
        .query(() => 'FROM TRPC'),
    roll: t.procedure
        .query(() => randomBytes(100).toString('base64'))
})
