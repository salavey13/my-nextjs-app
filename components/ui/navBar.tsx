import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Section {
  title: string;
}

interface NavBarProps {
  sections: Section[];
  currentSection: number;
  scrollToSection: (index: number) => void;
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
      className={`fixed bottom-14 right-0 z-50 p-4 transition-transform duration-500 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      } ${isExpanded ? "w-full h-auto bg-white shadow-xl rounded-lg" : "rounded-lg shadow-xl"}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {!isExpanded ? (
        <Button variant="outline" size="smallIcon">
          ☰
        </Button>
      ) : (
        <div className="flex flex-col">
          {sections.map((section, index) => (
            <Button
              key={index}
              onClick={() => scrollToSection(index)}
              variant={currentSection === index ? "secondary" : "neumorphism"}
              size="smallIcon"
              className="w-full text-center rounded-lg"
            >
              {section.title}
            </Button>
          ))}
        </div>
      )}
    </nav>
  );
}
