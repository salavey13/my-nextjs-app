'use client'

import { useAppContext } from '@/context/AppContext'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Crown, User, Coins, Trophy } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TopShelf: React.FC = () => {
  const { state, dispatch, t } = useAppContext()
  const user = state.user
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-gray-900/80 text-white flex justify-between items-center px-4 z-20 backdrop-blur-lg shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Crown className="w-5 h-5 mr-2 text-yellow-400" />
          <span className="text-sm font-medium">{t('rank')}: {user?.rank}</span>
        </div>
        <div className="flex items-center">
          <Coins className="w-5 h-5 mr-2 text-yellow-400" />
          <span className="text-sm font-medium">{user?.coins || 0}</span>
        </div>
        <div className="flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          <span className="text-sm font-medium">{user?.X || 0} XP</span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={user?.avatar_url || '/placeholder-user.jpg'} alt={user?.telegram_username} />
              <AvatarFallback>{user?.telegram_username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.telegram_username}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.role == 1 ? 'Admin' : ''}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>{t('profile')}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export default TopShelf