"use server"

import prisma from "@/lib/prisma"
import { getDbUserID } from "./user.action"
import { revalidatePath } from "next/cache"

export const createPost = async (content: string, img: string) => {
	try {
		const userID = await getDbUserID()

		const post = await prisma.post.create({
			data: {
				authorID: userID,
				content: content,
				image: img
			}
		})

		revalidatePath('/')
		return {
			success: true,
			data: post
		}
	} catch (error: unknown) {
		console.error(`Error: ${error}`);
		
		return {
			success: false,
			error: "Failed to create post"
		}
	}
}