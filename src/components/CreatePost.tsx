'use client'

import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react"

const CreatePost = () => {
	const { user } = useUser()
	const [content, setContent] = useState<string>("")
	const [image, setImage] = useState<string>("")
	const [isPosting, setIsPosting] = useState<boolean>(false)
	const [showImageUpload, setShowImageUpload] = useState<boolean>(false)

	const handleSubmit = () => {
		if (!content && !image) return

		setIsPosting(true)

		try {
			// await createPost(content, image)
		} catch (error) {
			
		} finally {
			setTimeout(() => setIsPosting(false), 2000)
		}
	}

	return (
		<Card className="mb-6">
			<CardContent className="pt-6">
				<div className="space-y-4">
					<div className="flex gap-x-4">
						<Avatar className="w-10 h-10">
							<AvatarImage src={user?.imageUrl ?? ''} />
						</Avatar>

						<Textarea
							placeholder="What's on your mind?"
							className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							disabled={isPosting}
						/>
					</div>

					<div className="flex items-center justify-between border-t pt-4">
						<div className="flex gap-x-2">
							<Button
								type="button"
								variant={'ghost'}
								size={'sm'}
								className="text-muted-foreground hover:text-primary"
								onClick={() => setShowImageUpload(prev => !prev)}
								disabled={isPosting}
							>
								<ImageIcon className="size-4 mr-2" />
								Photo
							</Button>
						</div>

						<Button
							className="flex items-center"
							onClick={handleSubmit}
							disabled={(!content.trim() && !image) || isPosting}
						>
							{isPosting ? (
								<>
									<Loader2Icon className="size-4 mr-2 animate-spin" />
									Posting...
								</>
							) : (
								<>
									<SendIcon className="size-4 mr-2" />
									Send
								</>
							)}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default CreatePost