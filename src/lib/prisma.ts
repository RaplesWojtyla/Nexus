import { Prisma, PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => new PrismaClient()

// declare const globalThis: {
// 	prismaGlobal: ReturnType<typeof prismaClientSingleton>
// } & typeof global

const globalForPrisma = globalThis as unknown as { prismaGlobal: ReturnType<typeof prismaClientSingleton> }

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma
