import { FastifyInstance } from 'fastify';
import z from 'zod';
import verifyJwt from '../lib/auth/verifyJwt';
import { supabase } from '../lib/supabaseClient'
import { PostDetails } from '../interfaces'
import { EditPostSchema, PostSchema } from '../lib/validation'
const postRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/api/posts', async (request, reply) => {
        try {
            // Check auth
            const user = await verifyJwt(request, reply);
            // Row level security policy implemented to only allow authenticated users to view posts
            const { data, error } = await supabase.from('posts').select(
                `
                id, title, body, created_at, user: user_uuid ( id, first_name, last_name )
                `
            );
            if (error) {
                throw new Error(error.message);
            }
            reply.status(200).send({ "data": data })
        } catch (error: any) {
            console.log(error)
            reply.status(500).send({ "message": "An error has occurred" })
        }
    });
    fastify.post('/api/posts', async (request, reply) => {
        // Check auth
        const user = await verifyJwt(request, reply);
        const requestData = request.body as PostDetails;
        try {
            const insertData = 
            {
                title: requestData.title, body: requestData.body, user_uuid: user.sub
            }
            console.log(insertData)
            PostSchema.parse(insertData);
            const { data, error } = await supabase.from('posts').insert(insertData)
            if (error) {
                throw new Error(error.message);
            }
        } catch (error: any) {
            console.log(error.message)
            reply.status(500).send({ "message": "An error has occurred" })
        }
        reply.status(200).send({ "message": "Post Created Successfully" })
    });

    fastify.put('/api/posts/:id', async (request, reply) => {
        // Check auth
        const user = await verifyJwt(request, reply);
        const requestData = request.body as PostDetails;
        const id = (request as any).params.id;
        try {
            const updateData = 
            {
                title: requestData.title, body: requestData.body, id: parseInt(id)
            }
            EditPostSchema.parse(updateData);
            const { data, error } = await supabase.from('posts').update(updateData).match({ id: id }).eq('user_uuid', user.sub)
            if (error) {
                throw new Error(error.message);
            }
        } catch (error: any) {
            console.log(error.message)
            reply.status(500).send({ "message": "An error has occurred" })
        }
        reply.status(200).send({ "message": "Post Updated Successfully" })
    });

    fastify.delete('/api/posts/:id', async (request, reply) => {
        // Check auth
        const user = await verifyJwt(request, reply);
        const id = (request as any).params.id;
        try {
            z.number().parse(parseInt(id));
            const { data, error } = await supabase.from('posts').delete().match({ id }).eq('user_uuid', user.sub)
            if (error) {
                throw new Error(error.message);
            }
        } catch (error: any) {
            console.log(error.message)
            reply.status(500).send({ "message": "An error has occurred" })
        }
        reply.status(200).send({ "message": "Post Deleted Successfully" })
    });
};

export default postRoutes;