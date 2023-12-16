import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { supabase } from '../lib/supabaseClient'
import { UserDetails } from '../interfaces'
import { UserDetailsSchema, SigninSchema } from '../lib/validation'

// https://supabase.com/docs/reference/javascript/auth-getsession
// Implement on front-end to store session in store and refresh when expired
const userRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/api/users/sign-up', async (request, reply) => {
            
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

    fastify.post('/api/users/sign-in', async (request, reply) => {
        const requestData = request.body as UserDetails;
        try {
            SigninSchema.parse(requestData);
            const { data: user, error } = await supabase.auth.signInWithPassword({
                email: requestData.email,
                password: requestData.password,
            })
            if (error) {
                throw new Error(error.message);
            } else if (!user) {
                reply.status(401).send({ "message": "User not found" })
            }
            reply.setCookie('access_token', `${user.session.access_token}`).send({ "message": "User Logged In Successfully" })
        } catch (error: any) {
            console.log(error.message)
            reply.status(500).send({ "message": error.message })
        }
    });
};

export default userRoutes;