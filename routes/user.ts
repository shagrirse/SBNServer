// Import necessary modules and interfaces
import { FastifyInstance } from 'fastify';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client instance
import { UserDetails } from '../interfaces'; // Import UserDetails interface
import { UserDetailsSchema, SigninSchema } from '../lib/validation'; // Import validation schemas

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
};

// Export userRoutes function as the default export
export default userRoutes;
