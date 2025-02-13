'use server'

import prisma from "@/lib/prisma";
import { auth, currentUser, User } from "@clerk/nextjs/server";


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

export const getDbUserID = async (): Promise<string> => {
	const { userId: clerkID } = await auth()

	if (!clerkID) throw new Error('Unauthorized')

	const user = await getUserByClerkID(clerkID)

	if (!user) throw new Error("User not found!")
	
	return user.id
}
