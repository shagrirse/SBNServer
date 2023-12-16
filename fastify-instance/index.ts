import fastify from 'fastify'
import cors from '@fastify/cors'

export default async function build() {
    const server = fastify()
    await server.register(cors)
    return server
}