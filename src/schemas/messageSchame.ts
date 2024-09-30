import { z } from "zod";

export const acceptMessageSchema = z.object({
    content: z.
    string().min(10, {message: "Content must be at least 10 characters"}).max(200, {message: "Content must be less than 200 characters"}),
})