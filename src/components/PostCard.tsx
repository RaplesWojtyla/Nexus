'use client'
import { createComment, deletePost, getPosts, toggleLike } from "@/action/post.action"
import { SignInButton, useUser } from "@clerk/nextjs"
import { Card, CardContent } from "./ui/card"
import Link from "next/link"
import { Avatar, AvatarImage } from "./ui/avatar"
import { formatDistanceToNow } from "date-fns"
import DeleteAlertDialog from "./DeleteAlertDialog"
import Image from "next/image"
import { Button } from "./ui/button"
import { useState } from "react"
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from "lucide-react"
import toast from "react-hot-toast"
import { Textarea } from "./ui/textarea"

type Posts = Awaited<ReturnType<typeof getPosts>>
type Post = Posts[number]

const PostCard = ({ post, dbUserID }: { post: Post, dbUserID: string | null }) => {
	const { user } = useUser()
	const [isLiking, setIsLiking] = useState<boolean>(false)
	const [hasLiked, setHasLiked] = useState<boolean>(post.likes.some(like => like.userID === dbUserID))
	const [optimisticLike, setOptimisticLike] = useState<number>(post._count.likes)
	const [isCommenting, setIsCommenting] = useState<boolean>(false)
	const [comment, setComment] = useState<string>("")
	const [showComments, setShowComments] = useState<boolean>(false)
	const [isDeleting, setIsDeleting] = useState<boolean>(false)

	const handleLike = async (): Promise<void> => {
		if (isLiking) return

		try {
			setIsLiking(true)
			setHasLiked(prev => !prev)
			setOptimisticLike(prev => prev + (hasLiked ? -1 : 1))
			
			const res = await toggleLike(post.id)

			if (!res.success) {
				toast.error(res.message, {
					duration: 3000,
					ariaProps: {
						role: 'status',
						"aria-live": 'polite'
					}
				})
			}
		} catch (error) {
			setOptimisticLike(post._count.likes)
			setHasLiked(post.likes.some(like => like.userID === dbUserID))

			console.error(`Error when trying to like the post: ${error}`)

			toast.error('Failed to like the post.', {
				duration: 3000,
				ariaProps: {
					role: 'status',
					"aria-live": 'polite'
				}
			})
		} finally {
			setIsLiking(false)
		}
	}

	const handleCreateComment = async (): Promise<void> => {
		if (isCommenting) return

		try {
			setIsCommenting(true)

			const res = await createComment(post.id, comment)

			if (res.success) {
				toast.success(res.message, {
					duration: 3000,
					ariaProps: {
						role: 'status',
						"aria-live": 'polite'
					}
				})

				setComment("")
			} else {
				toast.error(res.message, {
					duration: 3000,
					ariaProps: {
						role: 'status',
						"aria-live": 'polite'
					}
				})
			}
		} catch (error) {
			console.error(`Error when creating comment: ${error}`);

			toast.error("Failed to create comment.", {
				duration: 3000,
				ariaProps: {
					role: 'status',
					"aria-live": 'polite'
				}
			})
		} finally {
			setIsCommenting(false)
		}
	}

	const handleDeletePost = async (): Promise<void> => {
		if (isDeleting) return

		try {
			setIsDeleting(true)

			const res = await deletePost(post.id)

			if (res.success) {
				toast.success(res.message, {
					duration: 3000,
					ariaProps: {
						role: 'status',
						"aria-live": 'polite'
					}
				})
			} else {
				toast.error(res.message, {
					duration: 3000,
					ariaProps: {
						role: 'status',
						"aria-live": 'polite'
					}
				})
			}
		} catch (error: unknown) {
			console.error(`Error when deleting post: ${error}`);

			toast.error('Failed to delete post.', {
				duration: 3000,
				ariaProps: {
					role: 'status',
					"aria-live": 'polite'
				}
			})
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<Card className="overflow-hidden">
			<CardContent className="p-4 sm:p-6">
				<div className="space-y-4">
					<div className="flex gap-x-3 sm:gap-x-4 items-start">
						<Link href={`/profile/${post.author.username}`}>
							<Avatar className="size-8 sm:size-10">
								<AvatarImage src={post.author.profile_picture ?? '/avatar.png'} />
							</Avatar>
						</Link>

						{/* { Post Header & Caption } */}
						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between">
								<div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-2 truncate">
									<Link 
										href={`/profile/${ post.author.username }`}
										className="font-semibold truncate"
									>
										{post.author.name}
									</Link>

									<div className="flex items-center gap-x-2 text-sm text-muted-foreground">
										<Link href={`/profile/${ post.author.username }`}>
											@{post.author.username}
										</Link>
										<span>•</span>
										<span>{ formatDistanceToNow(new Date(post.createdAt)) } ago</span>
									</div>
								</div>

								{ dbUserID === post.author.id && (
									<DeleteAlertDialog 
										isDeleting={isDeleting}
										onDelete={handleDeletePost}
										title={'Delete Post'}
										description={"This action can't be undone. Are you sure?"}
									/>
								)}
							</div>
							
							{/* Post Caption */}
							<p className="mt-2 text-sm text-foreground break-words">{ post.content ?? "" }</p>
						</div>
					</div>
					
					{/* Post Image (If Exist) */}
					{post.image && (
						<div className="rounded-lg overflow-hidden">
							<Image className="w-full h-auto object-cover" src={post.image} alt="Post Image Content" />
						</div>
					)}

					{/* Like & Comment Button */}
					<div className="flex items-center pt-2 gap-x-4">
						{user ? (
							<Button
								variant={'ghost'}
								onClick={handleLike}
								className={`text-muted-foreground ${hasLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
							>
								{hasLiked ? (
									<HeartIcon className="size-5 fill-current" />
								) : (
									<HeartIcon className="size-5" />
								)}
								<span>{ optimisticLike }</span>
							</Button>
						) : (
							<SignInButton mode="modal">
								<Button
									variant={'ghost'}
									size={'sm'}
									className="text-muted-foreground gap-2"
								>
									<HeartIcon className="size-5" />
									<span>{ optimisticLike }</span>
								</Button>
							</SignInButton>
						)}
						
						<Button
							className="text-muted-foreground gap-2 hover:text-blue-500"
							variant={'ghost'}
							size={'sm'}
							onClick={() => setShowComments(prev => !prev)}
						>
							<MessageCircleIcon className={`size-5 ${showComments && 'fill-blue-500 text-blue-500'}`} />
							<span>{ post.comments.length }</span>
						</Button>
					</div>

					{/* Comments Section */}
					{showComments && (
						<div className="space-y-6 pt-4 border-t">
							<div className="space-y-4">
								{/* Display comments */}
								{post.comments.map(comment => (
									<div key={comment.id} className="flex gap-x-3">
										<Avatar className="size-8 flex-shrink-0">
											<AvatarImage src={comment.author.profile_picture ?? '/avatar.png'} />
										</Avatar>

										<div className="flex-1 min-w-0">
											<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
												<span className="font-medium text-sm">{ comment.author.name }</span>
												<span className="text-sm text-muted-foreground">@{ comment.author.username }</span>
												<span className="text-sm text-muted-foreground">•</span>
												<span className="text-sm text-muted-foreground">{ formatDistanceToNow(new Date(comment.createdAt)) }</span>
											</div>
											<p className="text-sm break-words">{ comment.content }</p>
										</div>
									</div>
								))}
							</div>

							{user ? (
								<div className="flex gap-x-2">
									<Avatar className="size-8 flex-shrink-0">
										<AvatarImage src={user.imageUrl ?? '/avatar.png'} />
									</Avatar>

									<div className="flex-1">
										<Textarea 
											placeholder="Write a comment..."
											value={comment}
											onChange={ (e) => setComment(e.target.value) }
											className="min-h-20 resize-none"
										/>

										<div className="flex justify-end mt-2">
											<Button
												size={'sm'}
												className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700"
												onClick={handleCreateComment}
												disabled={!comment.trim() || isCommenting}
											>
												{isCommenting ? (
													"Posting..."
												) : (
													<>
														<SendIcon className="size-4" />
														Send
													</>
												)}
											</Button>
										</div>
									</div>
								</div>
							) : (
								<div className="flex justify-center p-4 border rounded-lg bg-muted/50">
									<SignInButton mode="modal">
										<Button variant={'outline'} className="flex items-center gap-3">
											<LogInIcon className="size-4" />
											Sign in to comment
										</Button>
									</SignInButton>
								</div>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default PostCard