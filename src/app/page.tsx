import { getPosts } from "@/action/post.action"
import { getDbUserID } from "@/action/user.action"
import CreatePost from "@/components/CreatePost"
import FollowSuggestion from "@/components/FollowSuggestion"
import PostCard from "@/components/PostCard"
import { currentUser } from "@clerk/nextjs/server"

const Home = async () => {
	const user = await currentUser()
	const posts = await getPosts()
	const dbUserID = await getDbUserID()

	return (
		<div className='grid grid-cols-1 lg:grid-cols-10 gap-6'>
			<div className="lg:col-span-6">
				{ user && <CreatePost /> }

				<div className="space-y-4">
					{posts.map(post => (
						<PostCard key={post.id} post={post} dbUserID={dbUserID} />
					))}
				</div>
			</div>
			<div className="hidden lg:block lg:col-span-4 sticky top-20">
				<FollowSuggestion />
			</div>
		</div>
	)
}

export default Home