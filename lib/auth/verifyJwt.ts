// Import necessary types from Fastify for request and reply handling
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";

// Import the 'jsonwebtoken' library for JWT verification
var jwt = require('jsonwebtoken');

// Function to verify a JWT token from the request's cookies
const verifyJwt = async (request: FastifyRequest, reply: FastifyReply) => {
    // Extract the JWT token from the 'access_token' cookie in the request
    const token = request.cookies.access_token;

    try {
        // Verify the received JWT token using the JWT_SECRET stored in the environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // If the token is successfully verified, return the decoded token data
        return decoded;
    } catch (err) {
        // If there's an error during token verification, log the error and send a 401 response
        console.log(err);
        reply.status(401).send({
            message: 'Authentication failure',
        });
    }
};

// Export the verifyJwt function as the default export of this file
export default verifyJwt;
