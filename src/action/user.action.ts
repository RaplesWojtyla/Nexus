'use server'

import prisma from "@/lib/prisma";
import { auth, currentUser, User } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


export const syncUser = async () => {
	try {
		const { userId }: { userId: string | null } = await auth()
		const user: User | null = await currentUser()

		if (!userId || !user) return

		const existingUser = await prisma.user.findUnique({
			where: {
				clerkID: userId
			}
		})

		if (existingUser) return existingUser

		const dbUser = await prisma.user.create({
			data: {
				email: user.emailAddresses[0].emailAddress,
				username: user.username ?? user.emailAddresses[0].emailAddress.split('@')[0],
				clerkID: userId,
				name: `${user.firstName ?? ""} ${user.lastName ?? ""}`,
				profile_picture: user.imageUrl
			}
		})

		return dbUser
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error("Error in sync user.");
			console.error(`Error message: ${err.message}`);
			console.error(`Stack trace: ${err.stack}`);
		} else {
			console.error(`Unknown error occured: `);
		}

		throw new Error("An error occurred while syncing the user.")
	}
}

export const getUserByClerkID = (clerkID: string) => {
	try {
		const user = prisma.user.findUnique({
			where: {
				clerkID: clerkID
			},
			include: {
				_count: {
					select: {
						followers: true,
						following: true,
						posts: true
					}
				}
			}
		})

		return user
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new Error(error.message)
		} else {
			throw new Error('Unknown error occurred')
		}
	} 
}

export const getDbUserID = async (): Promise<string | null> => {
	const { userId: clerkID } = await auth()

	if (!clerkID) {
		console.error('User unauthenticated.')
		return null
	}

	const user = await getUserByClerkID(clerkID)

	if (!user) {
		console.error('User not found!')
		throw new Error("User not found!")
	}
	
	return user.id
}

export const getRandomUsers = async () => {
	try {
		const userID = await getDbUserID()

		if (!userID) return []

		const randomUsers = await prisma.user.findMany({
			where: {
				AND: [
					{NOT: {
						id: userID
					}},
					{NOT: {
						followers: {
							some: {
								followerID: userID
							}
						}
					}}
				]
			},
			select: {
				id: true,
				name: true,
				username: true,
				profile_picture: true,
				_count: {
					select: {
						followers: true,
					}
				}
			},
			take: 3
		})

		return randomUsers
	} catch (error: unknown) {
		console.error(`Error fetching random user: ${error}`);

		return []
	}
}

export const toggleFollow = async (targetUserID: string) => {
	try {
		const userID = await getDbUserID()

		if (!userID) return {success: false, error: 'Unauthenticated'}

		if (userID === targetUserID) throw new Error("You can't follow yourself")

		const existingFollow = await prisma.follows.findUnique({
			where: {
				followerID_followingID: {
					followerID: userID,
					followingID: targetUserID
				}
			}
		})

		if (!existingFollow) {
			await prisma.$transaction([
				prisma.follows.create({
					data: {
						followerID: userID,
						followingID: targetUserID
					}
				}),
				prisma.notification.create({
					data: {
						userID: targetUserID,
						creatorID: userID,
						type: "FOLLOW"
					}
				})
			])
		} else {
			await prisma.follows.delete({
				where: {
					followerID_followingID: {
						followerID: userID,
						followingID: targetUserID
					}
				}
			})
		}

		revalidatePath('/')
		return {success: true, error: ''}
	} catch (error: unknown) {	
		console.error(`Error fetching random user: ${error}`)

		return {
			success: false,
			error: "Error toggling follow"
		}
	}
}
