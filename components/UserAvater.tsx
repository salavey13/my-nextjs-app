import Image from 'next/image'

export default function UserAvatar({ avatarUrl }: { avatarUrl: string }) {
  return (
    <div className="relative w-16 h-16 rounded-full overflow-hidden">
      <Image
        src={avatarUrl}
        alt="User Avatar"
        layout="fill"
        objectFit="cover"
      />
    </div>
  )
}