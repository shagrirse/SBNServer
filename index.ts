// Import required modules and dependencies
import fastify from 'fastify'; // Import Fastify
import cors from '@fastify/cors'; // Import CORS plugin
import registerRoutes from './routes'; // Import routes
import fastifyMultipart from '@fastify/multipart'

const fs = require('node:fs')
const util = require('node:util')
const { pipeline } = require('node:stream')
const pump = util.promisify(pipeline)
// Import types
import { FastifyCookieOptions } from '@fastify/cookie';

// Create a Fastify server instance
const server = fastify();
server.register(fastifyMultipart)

// Register CORS plugin to enable Cross-Origin Resource Sharing
server.register(cors, {
    origin: true, // Allow requests from any origin
    credentials: true, // Enable sending credentials (cookies, authorization headers, etc.)
    exposedHeaders: ["Set-Cookie"] // Expose 'Set-Cookie' header to the client
});

// Register the @fastify/cookie plugin for handling cookies
server.register(require('@fastify/cookie'), {
    secret: process.env.COOKIE_SECRET, // Set the secret for cookie encryption
    hook: 'onRequest', // Hook to handle cookies on each request
    parseOptions: {
        path: '/', // Set the default path for cookies
        maxAge: 36000 // Set the maximum age (in seconds) for the cookie
    }
} as FastifyCookieOptions);

// Register routes by importing and using the exported function from './routes'
server.register(registerRoutes);

// Start the server and listen on port 8080
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
