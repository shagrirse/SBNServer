import { FastifyInstance } from 'fastify';
import userRoutes from './user';
import postRoutes from './posts';
// Import other route files as needed

const registerRoutes = async (fastify: FastifyInstance) => {
  // Register all routes from different files here
  await userRoutes(fastify);
  await postRoutes(fastify);
  // Register other route files as needed
};

export default registerRoutes;