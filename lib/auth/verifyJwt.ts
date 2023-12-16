//  Import the jsonwebtoken library and verify the token in the request header

import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";

// Path: lib/auth/verifyJwt.ts
var jwt = require('jsonwebtoken');

const verifyJwt = async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies.access_token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        console.log(err);
        reply.status(401).send({
        message: 'Authentication failure',
        });
    }
};

export default verifyJwt;