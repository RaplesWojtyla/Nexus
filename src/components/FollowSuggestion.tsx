import { getRandomUsers } from "@/action/user.action"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import FollowButton from "./FollowButton";

const FollowSuggestion = async () => {
	const randUsers = await getRandomUsers()

	if (!randUsers.length) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Follow Suggestions</CardTitle>
				<CardDescription hidden>Other users that current user can follow</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{randUsers.map(user => (
						<div key={user.id} className="flex items-center	justify-between">
							<div className="flex items-center gap-1">
								<Link href={`/profile/${user.username}`}>
									<Avatar>
										<AvatarImage src={user.profile_picture ?? '/avatar.png'} />
									</Avatar>
								</Link>
								<div className="text-xs">
									<Link href={`/profile/${user.username}`}>{ user.name }</Link>
									<p className="text-muted-foreground">@{ user.username }</p>
									<p className="text-muted-foreground">{ user._count.followers } followers</p>
								</div>
							</div>
							<FollowButton userID={user.id} />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

export default FollowSuggestion