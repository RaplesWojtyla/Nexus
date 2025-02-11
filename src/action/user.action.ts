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