// Import necessary modules and interfaces
import { FastifyInstance } from 'fastify';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client instance
import verifyJwt from '../lib/auth/verifyJwt';
import { UserDetails } from '../interfaces'; // Import UserDetails interface
import { UserDetailsSchema, SigninSchema } from '../lib/validation'; // Import validation schemas
import { uploadStream } from '../lib/cloudinaryClient';

// Define userRoutes function that handles user-related routes
const userRoutes = async (fastify: FastifyInstance) => {
    // Route for user sign-up
    fastify.post('/api/users/sign-up', async (request, reply) => {
        // Extract request body and cast it to UserDetails type
        const requestData = request.body as UserDetails;
        try {
            // Validate incoming user details against UserDetailsSchema
            UserDetailsSchema.parse(requestData);

            // Create a new user in Supabase authentication with email and password
            const { data: user, error } = await supabase.auth.signUp({
                email: requestData.email,
                password: requestData.password,
            });

            // Insert user profile details into 'profiles' table
            const { data, error: insertError } = await supabase.from('profiles').insert({
                id: user.user?.id, // Use the user's ID from Supabase auth
                first_name: requestData.first_name,
                last_name: requestData.last_name,
            });

            // Check for errors during sign-up or profile insertion
            if (insertError || error) {
                throw new Error(error?.message || insertError?.message || 'An error occurred');
            }
        } catch (error: any) {
            // Handle any caught errors and log the error message
            console.log(error.message);
            reply.status(500).send({ "message": error.message });
        }
        // Respond with a success message after user creation
        reply.status(200).send({ "message": "User Created Successfully" });
    });

    // Route for user sign-in
    fastify.post('/api/users/sign-in', async (request, reply) => {
        // Extract request body and cast it to UserDetails type
        const requestData = request.body as UserDetails;
        try {
            // Validate incoming user details against SigninSchema
            SigninSchema.parse(requestData);

            // Sign in user using email and password via Supabase authentication
            const { data: user, error } = await supabase.auth.signInWithPassword({
                email: requestData.email,
                password: requestData.password,
            });

            // Check for authentication errors or missing user
            if (error) {
                throw new Error(error.message);
            } else if (!user) {
                reply.status(401).send({ "message": "User not found" });
            }

            // Set a cookie with access token and send success message upon successful login
            reply.setCookie('access_token', `${user.session.access_token}`).send({ "message": "User Logged In Successfully" });
        } catch (error: any) {
            // Handle any caught errors during sign-in and log the error message
            console.log(error.message);
            reply.status(500).send({ "message": error.message });
        }
    });

    fastify.get('/api/users/me', async (request, reply) => {
        // Check auth
        const user = await verifyJwt(request, reply);
        try {
            const { data, error } = await supabase.from('profiles').select(`
                id, first_name, last_name, image_url
            `).eq('id', user.sub)
            if (error) {
                throw new Error(error.message);
            }
            reply.status(200).send({ "data": data })
        } catch (error: any) {
            console.log(error)
            reply.status(500).send({ "message": "An error has occurred" })
        }
    });

    fastify.post('/api/users/image', async (request, reply) => {
        // Check auth
        const user = await verifyJwt(request, reply);
        const requestData = await request.file();
        // Read as byte array buffer
        try {
            const buffer = await requestData?.toBuffer();
            const upload: any = await uploadStream(buffer);
            const { data: updateData, error: updateError } = await supabase.from('profiles').update({ image_url: upload.secure_url }).eq('id', user.sub)
            if (updateError) {
                throw new Error(updateError.message);
            }
            reply.status(200).send({ "data": upload.secure_url })
        } catch (error: any) {
            console.log(error)
            reply.status(500).send({ "message": "An error has occurred" })
        }
    });

};

// Export userRoutes function as the default export
export default userRoutes;
