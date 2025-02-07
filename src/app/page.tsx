import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import React from 'react'
import ThemeToggle from '@/components/ThemeToggle'

const Home = () => {
	return (
		<div className='m-4'>
			<SignedOut>
				<SignInButton mode='modal' >
					<Button>
						Sign In
					</Button>
				</SignInButton>
			</SignedOut>
			<SignedIn>
				<UserButton />
			</SignedIn>
			<ThemeToggle />
		</div>
	)
}

export default Home