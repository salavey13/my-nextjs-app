//app\profile\page.tsx
import Profile from "@/components/Profile";
import AboutApp from '@/components/ui/AboutApp';
export default function ProfilePage() {
  return
    <div className="flex-grow" >
     <Profile />;
     <AboutApp />; 
    </div>
}
