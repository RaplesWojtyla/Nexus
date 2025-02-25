'use server'

import prisma from "@/lib/prisma"
import { getDbUserID } from "./user.action"

export const getNotifications = async () => {
	try {
		const dbUserID = await getDbUserID()

		if (!dbUserID) return []

		const notifications = await prisma.notification.findMany({
			where: {
				userID: dbUserID
			},
			include: {
				creator: {
					select: {
						id: true,
						name: true,
						username: true,
						profile_picture: true
					}
				},
				post: {
					select: {
						id: true,
						content: true,
						image: true
					}
				},
				comment: {
					select: {
						id: true,
						content: true,
						createdAt: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return notifications
	} catch (error) {
		console.error(`Error when fetching the notifications: ${error}`);
		
		throw new Error("Failed to fetch notifications")
	}
}

export const markNotificationsAsRead = async (notificationsID: string[]) => {
	try {
		await prisma.notification.updateMany({
			where: {
				id: {
					in: notificationsID
				}
			},
			data: {
				read: true
			}
		})

		return {
			success: true,
			message: 'Successfully read the unread notifications'
		}
	} catch (error) {
		console.error(`Error when marking the notifications as read: ${error}`)

		return {
			success: false,
			message: 'Failed read the notifications'
		}
	}
}