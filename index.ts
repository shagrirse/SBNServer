import fastify from 'fastify'
import cors from '@fastify/cors';
import registerRoutes from './routes';
import { FastifyCookieOptions } from '@fastify/cookie';

const server = fastify()
server.register(cors, {
    origin: true,
    credentials: true,
    exposedHeaders: ["Set-Cookie"]
})

server.register(require('@fastify/cookie'), {
    secret: process.env.COOKIE_SECRET, // for cookies signature
    hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: {
        path: '/', // Set the path to which the cookie belongs
        maxAge: 1, // Set the expiration time of the cookie in seconds
        // Other options like 'maxAge', 'expires', etc., can be set as needed
    }  // options for parsing cookies
} as FastifyCookieOptions)

server.register(registerRoutes);
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})