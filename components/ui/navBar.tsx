import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface NavBarProps {
  sections: string[];
  currentSection: string;
  scrollToSection: (section: string) => void;
}

export default function NavBar({ sections, currentSection, scrollToSection }: NavBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleScroll = () => {
    const scrollY = window.scrollY;
    setIsVisible(scrollY === 0 || window.scrollY < scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed bottom-4 right-0 z-50 p-4 transition-transform duration-500 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      } ${isExpanded ? "w-full h-auto bg-white shadow-xl rounded-md" : "w-16 h-16 bg-primary rounded-full"}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {!isExpanded ? (
        <Button variant="neumorphism" size="smallIcon">
          ☰
        </Button>
      ) : (
        <div className="flex flex-col space-y-2">
          {sections.map((section, index) => (
            <Button
              key={index}
              onClick={() => scrollToSection(index)}
              variant={currentSection === index ? "default" : "outline"}
            >
              {section.title}
            </Button>
          ))}
        </div>
      )}
    </nav>
  );
}
