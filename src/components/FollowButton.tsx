'use client'
import { useState } from "react"
import { Button } from "./ui/button"
import { Loader2Icon } from "lucide-react"
import { toggleFollow } from "@/action/user.action"
import toast from "react-hot-toast"

const FollowButton = ({ userID } : { userID: string }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const handleFollow = async () => {
		setIsLoading(true)

		try {
			const res = await toggleFollow(userID)
			
			if (res.success) {
				toast.success("User Followed successfully")
			} else {
				toast.error(res.error)
			}
		} catch (error) {
			toast.error("Internal server error.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Button
			variant={'secondary'}
			size={'sm'}
			className="w-20"
			onClick={handleFollow}
			disabled={isLoading}
		>
			{ isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow" }
		</Button>
	)
}

export default FollowButton