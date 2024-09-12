// app/profile/page.tsx
import Profile from "@/components/Profile";
import AboutApp from '@/components/ui/AboutApp';

export default function ProfilePage() {
  return (
    <div className="flex-grow relative">
      <div className="absolute top-0 left-0">
        <AboutApp />
      </div>
      <Profile />
    </div>
  );
}
