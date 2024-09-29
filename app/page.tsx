// src/app/page.tsx
import HackButtonStoryShower from "../components/HackButton"
import DevKit from '@/components/DevKit'
//import { useAppContext } from '@/context/AppContext'
export default function HackButtonPage() {
  // const { user } = useAppContext()

  // if (!process.env.NEXT_PUBLIC_ENABLE_DEVKIT || (user && user.role !== 'developer')) {
  //   return <div>Access Denied</div>
  // }
  return 
  //<>
    {/*<HackButtonStoryShower />;*/}
    <DevKit />
  //</> 
}
