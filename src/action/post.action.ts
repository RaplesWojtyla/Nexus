"use server"

import prisma from "@/lib/prisma"
import { getDbUserID } from "./user.action"
import { revalidatePath } from "next/cache"
import { getTime } from "date-fns"
import { Comment } from "@prisma/client"

export const createPost = async (content: string, img: string) => {
	try {
		const userID = await getDbUserID()

		if (!userID) return {success: false, error: "Unauthorized"}

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

export const getPosts = async () => {
	try {
		const posts = await prisma.post.findMany({
			include: {
				author: {
					select: {
						id: true,
						name: true,
						username: true,
						profile_picture: true
					}
				},
				comments: {
					include: {
						author: {
							select: {
								name: true,
								username: true,
								profile_picture: true
							}
						},
					},
					orderBy: {
						createdAt: 'asc'
					}
				},
				likes: {
					select: {
						userID: true
					}
				},
				_count: {
					select: {
						likes: true,
						comments: true
					}
				}
			},
		})

		return posts
	} catch (error: unknown) {
		console.error(`Error fetching posts: ${error}`)

		throw new Error("Failed to fetch posts.")
	}
}

export const toggleLike = async (postID: string) => {
	try {
		const userID = await getDbUserID()
		if (!userID) throw new Error('User not found')

		const existingLike = await prisma.like.findUnique({
			where: {
				userID_postID: {
					userID: userID,
					postID: postID
				}
			}
		})

		const post = await prisma.post.findUnique({
			where: {
				id: postID
			},
			select: {
				authorID: true
			}
		})

		if (!post) throw new Error('Post not found.')
			
		if (existingLike) {
			const notification = await prisma.notification.findFirst({
				where: {
					userID: post.authorID,
					creatorID: userID,
					postID: postID,
					type: "LIKE"
				},
				orderBy: {
					createdAt: "desc"
				}
			})

			if (notification && Date.now() - getTime(notification.createdAt) < 60_000) {
				await prisma.notification.deleteMany({
					where: {
						userID: post.authorID,
						creatorID: userID,
						postID: postID,
						type: "LIKE"
					}
				})
			}

			await prisma.like.delete({
				where: {
					userID_postID: {
						userID: userID, 
						postID: postID
					}
				}
			})
		} else {
			await prisma.$transaction([
				prisma.like.create({
					data: {
						userID: userID,
						postID: postID
					}
				}),
				...(post.authorID !== userID ? [ 
					prisma.notification.create({
						data: {
							userID: post.authorID,
							creatorID: userID,
							type: "LIKE",
							postID: postID
						}
					})
				] : [])
			])
		}

		revalidatePath('/')
		return {
			success: true,
			message: 'Successfully liked the post'
		}

	} catch (error) {
		console.error(`Error when liking post: ${error}`)

		return {
			success: false,
			message: 'Internal server error.'
		}
	}
}

export const createComment = async (postID: string, content: string | null) => {
	try {
		const dbUserID = await getDbUserID()
		if (!dbUserID) {
			console.error('User not found.')
			throw new Error("User not found!")
		}
		
		if (!content) {
			console.error("Content can't be empty.");
			throw new Error("Content is required.")
		}

		const post = await prisma.post.findUnique({
			where: {id: postID},
			select: {authorID: true}
		})

		if (!post) throw new Error("Post not found.")


		const [comment] = await prisma.$transaction(async trans => {
			const newComment: Comment = await trans.comment.create({
				data: {
					authorID: dbUserID,
					content: content,
					postID: postID
				}
			})

			if (post.authorID !== dbUserID) {
				await trans.notification.create({
					data: {
						userID: post.authorID,
						creatorID: dbUserID,
						type: "COMMENT",
						postID: postID,
						commentID: newComment.id
					}
				})
			}

			return [newComment]
		})

		revalidatePath('/')
		return {
			success: true,
			message: "Comment created successfully",
			content: comment
		}
	} catch (error: unknown) {
		console.error(`Error when creating comment: ${error}`)

		return {
			success: false,
			message: "Failed to create comment"
		}
	}
}

export const deletePost = async (postID: string) => {
	try {
		const dbUserID = await getDbUserID()
		if (!dbUserID) {
			console.error('User not found.')
			throw new Error("Unauthenticated")
		}

		const post = await prisma.post.findUnique({
			where: {id: postID},
			select: {authorID: true}
		})

		if (!post) {
			console.error('Post not found');
			throw new Error("Post not found.")
		}

		if (dbUserID !== post.authorID) {
			return {
				success: false,
				message: 'Unauthorized - You are not the author of this post.'
			}
		}

		await prisma.post.delete({
			where: {id: postID}
		})

		revalidatePath('/')
		return {
			success: true,
			message: 'Successfully deleted the post.'
		}
	} catch (error: unknown) {
		console.error(`Failed to delete post: ${error}`)

		return {
			success: false,
			message: 'Internal server error'
		}
	}
}
