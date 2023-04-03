import { randomBytes, pbkdf2Sync } from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


const main = async () => {
    const username = ''
    const password = ''
    
    const keylen = 32
    const salt = randomBytes(24).toString('base64')
    const iterations = 32000
    const digest = 'SHA512'
    const passwordHash = pbkdf2Sync(password, salt, iterations, keylen, digest).toString('base64')

    console.log(await prisma.user.create({data: {
        name: username,
        hash: {
            create: {
                salt, iterations, digest, keylen, passwordHash
            }
        }
    }}))
}
