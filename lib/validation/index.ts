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

export const PostSchema = z.object({
    title: z.string(),
    body: z.string(),
    user_uuid: z.string().uuid(),
})

export const EditPostSchema = z.object({
    title: z.string(),
    body: z.string(),
    id: z.number(),
})