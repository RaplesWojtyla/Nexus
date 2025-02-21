import { Loader2Icon, TrashIcon } from "lucide-react"
import { Button } from "./ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"

interface DeleteAlertDialogProps {
	isDeleting: boolean
	onDelete: () => Promise<void>
	title: string
	description: string
}

const DeleteAlertDialog = ({
	isDeleting,
	onDelete,
	title,
	description
}: DeleteAlertDialogProps) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant={'ghost'}
					size={'sm'}
					className="text-muted-foreground hover:text-red-500 -mr-2"
				>
					{isDeleting ? (
						<Loader2Icon className="size-4 animate-spin" />
					) : (
						<TrashIcon className="size-4" />
					)}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{ title }</AlertDialogTitle>
					<AlertDialogDescription>{ description }</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onDelete}
						className="bg-red-500 hover:bg-red-700"
					>
						{ isDeleting ? "Deleting..." : "Delete" }
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default DeleteAlertDialog