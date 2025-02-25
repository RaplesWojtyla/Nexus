import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Skeleton } from "./ui/skeleton"

const NotificationSkeleton = () => {

	const skeletonItems: Array<number> = Array.from({ length: 5 }, (_, i) => i)

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Notifications</CardTitle>
						<Skeleton className="h-4 w-20" />
						<CardDescription hidden>Notifications</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<ScrollArea className="h-[calc(100vh-13rem)]">
						{skeletonItems.map(item => (
							<div key={item} className="flex items-start gap-4 p-4 border-b">
								<Skeleton className="size-10 rounded-full" />
								<div className="flex-1 space-y-3">
									<div className="flex items-center gap-x-2">
										<Skeleton className="size-4" />
										<Skeleton className="h-4 w-40" />
									</div>
									<div className="pl-6 space-y-2">
										<Skeleton className="h-20 w-full" />
										<Skeleton className="h-4 w-24" />
									</div>
								</div>
							</div>
						))}
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	)
}

export default NotificationSkeleton