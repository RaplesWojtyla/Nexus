'use client'
import { getNotifications, markNotificationsAsRead } from "@/action/notifications.action";
import NotificationSkeleton from "@/components/NotificationSkeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlus2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";

type Notifications = Awaited<ReturnType<typeof getNotifications>>
type Notification = Notifications[number]

const getNotificationType = (type: 'LIKE' | 'FOLLOW' | 'COMMENT', creator: string | null) => {
	if (type === 'LIKE') return (
		<>
			<HeartIcon className="size-4 text-red-500" />
			<span> <span className="font-medium">{creator}</span> liked your post</span>
		</>
	)
	else if (type === 'FOLLOW') return (
		<>
			<UserPlus2Icon className="size-4 text-green-500" />
			<span> <span className="font-medium">{creator}</span> started following you</span>
		</>
	)
	else return (
		<>
			<MessageCircleIcon className="size-4 text-blue-500" />
			<span> <span className="font-medium">{creator}</span> commented on your post</span>
		</>
	)
}

const Notifications = () => {
	const { user } = useUser()
	if (!user) return null

	const [loading, setLoading] = useState<boolean>(true);
	const [notifications, setNotifications] = useState<Array<Notification>>([])

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const allNotifications = await getNotifications()
				setNotifications(allNotifications)

				const unreadNotifyIDs = allNotifications.filter(notification => !notification.read).map(notif => notif.id)

				if (unreadNotifyIDs.length) markNotificationsAsRead(unreadNotifyIDs)
			} catch (error) {
				console.error(`Error when fethcing the notifications: ${error}`)
				toast.error('Failed to fetch notifications');
			} finally {
				setLoading(false);
			}
		}

		fetchNotifications()
	}, [])

	if (loading) return <NotificationSkeleton />

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="border-b">
					<div className="flex items-center justify-between">
						<CardTitle>Notifications</CardTitle>
						<span className="text-sm text-muted-foreground">{notifications.filter(notify => !notify.read).length} unreads</span>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<ScrollArea className="h-[calc(100vh-13rem)]">
						{notifications.length === 0 ? (
							<div className="flex h-[calc(100vh-13rem)] justify-center items-center font-medium text-muted-foreground">
								No Notifications Yet
							</div>
						) : (
							notifications.map(notification => (
								<div
									key={notification.id}
									className={`flex items-start gap-4 p-4 border-b border-black/10 hover:bg-gray-200 dark:hover:bg-muted/30 transition-colors
										${!notification.read ? 'bg-gray-200 dark:bg-muted/50' : ''}`}
								>
									<Avatar className="mt-2">
										<AvatarImage src={notification.creator.profile_picture ?? '/avatar.png'} />
									</Avatar>

									<div className="flex-1 space-y-3">
										<div className="flex items-center gap-x-2">
											{getNotificationType(notification.type, notification.creator.name)}
										</div>

										{notification.post &&
											(notification.type === 'LIKE' || notification.type === 'COMMENT') && (
												<div className="pl-6 space-y-2">
													<div className="bg-muted dark:bg-muted/30 rounded-md p-2 mt-2">
														<p className="text-sm text-muted-foreground">
															{notification.post.content}
														</p>
														{notification.post.image && (
															<Image
																className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
																src={notification.post.image}
																alt="Post Image"
															/>
														)}
													</div>

													{notification.type === 'COMMENT' && notification.comment && (
														<div className="bg-accent dark:bg-accent/50 rounded-md text-sm text-muted-foreground p-2">
															{notification.comment.content}
														</div>
													)}
												</div>
											)}

										<p className="text-sm text-muted-foreground pl-6">
											{formatDistanceToNow(new Date(notification.createdAt), {
												addSuffix: true
											})}
										</p>
									</div>
								</div>
							))
						)}
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	)
}

export default Notifications