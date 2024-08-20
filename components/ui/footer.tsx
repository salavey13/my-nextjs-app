import Link from "next/link";
import { Home } from "lucide-react"; // Assuming you have Lucide icons or similar installed

const Footer = () => {
  return (
    //<footer className="bg-gray-900 text-gray-400 p-3">
      <div className="flex justify-center items-center text-xs space-x-4 bg-gray-900 text-gray-400 p-3">
        <Link href="/" className="flex items-center space-x-1">
          <Home className="w-4 h-4 text-gray-400 hover:text-white" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <Link href="/privacy-policy" className="hover:text-white transition-colors">
          Политика конфиденциальности
        </Link>
        <Link href="/terms-of-service" className="hover:text-white transition-colors">
          Условия использования
        </Link>
        <Link href="/privacy-policy-en" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
        <Link href="/terms-of-service-en" className="hover:text-white transition-colors">
          Terms of Service
        </Link>
      </div>
  );
};

export default Footer;
