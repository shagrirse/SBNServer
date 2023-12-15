import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { supabase } from '../lib/supabaseClient'
import { UserDetails } from '../interfaces'
import { UserDetailsSchema, SigninSchema } from '../lib/validation'

// https://supabase.com/docs/reference/javascript/auth-getsession
// Implement on front-end to store session in store and refresh when expired
const postRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/api/posts', async (request, reply) => {
        // Check auth
        const { data: user, error: authError } = await supabase.auth.getUser(request.cookies.access_token);
        if (authError || !user) {
            reply.status(401).send({ "message": "Authentication failure" })
        }
        // Row level security policy implemented to only allow authenticated users to view posts
        const { data, error } = await supabase.from('posts').select('*');
        if (error) {
            throw new Error(error.message);
        }
        reply.status(200).send({ "data": data })
    });
    fastify.post('/api/posts', async (request, reply) => {
        const requestData = request.body as UserDetails;
        try {
            UserDetailsSchema.parse(requestData);
            const { data: user, error } = await supabase.auth.signUp({
                email: requestData.email,
                password: requestData.password,
            })
            const { data, error: insertError } = await supabase.from('profiles').insert(
                {
                    id: user.user?.id, first_name: requestData.first_name, last_name: requestData.last_name
                })
            if (insertError || error) {
                throw new Error(error?.message || insertError?.message || 'An error occurred');
            }
        } catch (error: any) {
            console.log(error.message)
            reply.status(500).send({ "message": error.message })
        }
        reply.status(200).send({ "message": "User Created Successfully" })
    });
};

export default postRoutes;