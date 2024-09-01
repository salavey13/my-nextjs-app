//components/ui/footer.tsx
"use client"; // Add this line at the top

import Link from "next/link";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation"; // Import usePathname
import { useAppContext } from "../../context/AppContext";

const Footer: React.FC = () => {
  const pathname = usePathname(); // Use usePathname to get the current path
  const { user } = useAppContext();

  // Determine if the current page is the home page
  const isHomePage = pathname === "/";

  // Determine which set of links to show based on the user's language setting
  const isRussian = user?.lang === "ru";

  return (
    <footer className="bg-gray-900 text-gray-400 p-3">
      <div className="flex justify-center items-center text-xs space-x-4">
        {/* Conditionally render the Home link */}
        {!isHomePage && (
          <Link href="/" className="flex items-center space-x-1">
            <Home className="w-4 h-4 text-gray-400 hover:text-white" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        )}

        {/* Conditionally render language-specific links */}
        {isRussian ? (
          <>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">
              Условия использования
            </Link>
          </>
        ) : (
          <>
            <Link href="/privacy-policy-en" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service-en" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </>
        )}
      </div>
    </footer>
  );
};

export default Footer;
