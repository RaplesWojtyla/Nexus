import CreatePost from "@/components/CreatePost"
import FollowSuggestion from "@/components/FollowSuggestion"

const Home = () => {
	return (
		<div className='grid grid-cols-1 lg:grid-cols-10 gap-6'>
			<div className="lg:col-span-6">
				<CreatePost />
			</div>
			<div className="hidden lg:block lg:col-span-4 sticky top-20">
				<FollowSuggestion />
			</div>
		</div>
	)
}

export default Home