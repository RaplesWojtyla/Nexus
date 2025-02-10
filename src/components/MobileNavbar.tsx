'use client'

import { SignInButton, SignOutButton, useAuth } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import React, { useState } from 'react'
import { Button } from './ui/button'
import ThemeToggle from './ThemeToggle'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { BellIcon, HomeIcon, LogOutIcon, MenuIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'

const MobileNavbar = () => {
	const [isShowMenu, setIsShowMenu] = useState<boolean>(false)
	const { isSignedIn } = useAuth()
	const {theme, setTheme} = useTheme()

	return (
		<div className='flex items-center md:hidden gap-x-3'>
			<ThemeToggle />

			<Sheet open={isShowMenu} onOpenChange={setIsShowMenu}>
				<SheetTrigger asChild>
					<Button variant={'ghost'} size={'icon'}>
						<MenuIcon className='w-5 h-5' />
					</Button>
				</SheetTrigger>
				<SheetContent side={'right'} className='w-[300px]'>
					<SheetHeader>
						<SheetTitle>
							Menu
						</SheetTitle>
						<SheetDescription hidden aria-hidden={true}>
							Mobile Navigation Bar
						</SheetDescription>
					</SheetHeader>

					<nav className='flex flex-col gap-y-2 mt-6'>
						<Button variant={'ghost'} className='flex items-center justify-start gap	-3' asChild>
							<Link href={'/'}>
								<HomeIcon className='w-4 h-4' />
								<span>Home</span>
							</Link>
						</Button>

						{isSignedIn ? (
							<>
								<Button variant={'ghost'} className='flex items-center justify-start gap-3' asChild>
									<Link href={'/notifications	'}>
										<BellIcon className='w-4 h-4' />
										<span>Notifications</span>
									</Link>
								</Button>

								<Button variant={'ghost'} className='flex items-center justify-start gap-3' asChild>
									<Link href={'/profile'}>
										<UserIcon className='w-4 h-4' />
										<span>Profile</span>
									</Link>
								</Button>

								<SheetClose>
									<SignOutButton>
										<Button variant={'ghost'} className='flex w-full items-center justify-start gap-3'>
											<LogOutIcon className='w-4 h-4' />
											<span>Logout</span>
										</Button>
									</SignOutButton>
								</SheetClose>
							</>
						) : (
							<>
								<SheetClose>
									<SignInButton mode={'modal'}>
										<Button className='w-full'>
											Sign In
										</Button>
									</SignInButton>
								</SheetClose>
							</>
						)}
					</nav>
				</SheetContent>
			</Sheet>
		</div>
	)
}

export default MobileNavbar