import { z } from "zod"

export const UserDetailsSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
})

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})