import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Moon, Sun, Menu, X, ArrowRight } from "lucide-react";
import logoImage from "/logo.png";
import { useDarkMode } from "../contexts/DarkModeContext";

const NAV_LINKS = [
  { name: "Products", href: "/products", sectionId: "features" },
  { name: "Customers", href: "/customers", sectionId: "testimonials" },
  { name: "Pricing", href: "/pricing", sectionId: "pricing" },
  { name: "Resources", href: "/resources", sectionId: "faq" },
  { name: "Contact", href: "/contact" },
];

const Navbar = ({ onGetStarted }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (link) => {
    setIsMobileMenuOpen(false);
    
    // If we're on the homepage and the link has a sectionId, scroll to that section
    if (location.pathname === "/home" && link.sectionId) {
      const element = document.getElementById(link.sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        return;
      }
    }
    
    // Otherwise, navigate to the href
    navigate(link.href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-transparent backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-3 lg:py-4">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-300 hover:text-white rounded-md focus:outline-none transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Open menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate("/home");
            }}
          >
            <img src={logoImage} alt="Logo" className="w-8 h-8 rounded-lg object-cover dark:brightness-0 dark:invert" />
            <span className="text-lg sm:text-xl font-bold whitespace-nowrap bg-gradient-to-r from-[var(--brand-60)] via-[var(--brand-50p)] to-[var(--brand-70)] bg-clip-text text-transparent dark:text-white">Thinklytics</span>
          </div>
        </div>

        {/* Center: Nav links in pill */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-800/80 dark:bg-[var(--bg-lv2)] shadow-md border border-gray-700 dark:border-[var(--border-grey)]">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link)}
                  className={
                    `relative px-4 py-1.5 rounded-full text-base font-medium transition-colors duration-200 text-gray-200 hover:text-white focus:outline-none ` +
                    (isActive ? "font-bold text-white" : "")
                  }
                  style={{ background: "none" }}
                >
                  <span>{link.name}</span>
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 bottom-0 h-1 w-5/6 rounded-full transition-all duration-200 pointer-events-none ` +
                      (isActive
                        ? "bg-gradient-to-r from-[var(--brand-60)] via-[var(--brand-50p)] to-[var(--brand-70)] opacity-100"
                        : "opacity-0 group-hover:opacity-100")
                    }
                  ></span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Light/dark toggle + CTA */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center w-10 h-10 text-[var(--brand-70)] hover:text-[var(--brand-60)] rounded-full focus:outline-none transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Button
            onClick={onGetStarted}
            className="hidden sm:flex bg-[var(--brand-60)] hover:bg-[var(--brand-70)] text-white px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base transition-colors duration-200 items-center gap-2 shadow"
          >
            <span>Start now</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-gray-900/95 dark:bg-[var(--bg-lv1)]/95 border-b border-gray-800 dark:border-[var(--border-grey)] shadow-xl animate-fade-in z-50 backdrop-blur-md">
          <div className="flex flex-col items-stretch gap-1 py-4 px-4">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link)}
                  className={
                    `relative w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 text-gray-200 hover:text-white hover:bg-gray-800/50 dark:hover:bg-[var(--bg-lv2)]/50 focus:outline-none ` +
                    (isActive ? "font-bold text-white bg-gray-800/50 dark:bg-[var(--bg-lv2)]/50" : "")
                  }
                  style={{ background: "none" }}
                >
                  <span>{link.name}</span>
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 bottom-1 h-1 w-5/6 rounded-full transition-all duration-200 pointer-events-none ` +
                      (isActive
                        ? "bg-gradient-to-r from-[var(--brand-60)] via-[var(--brand-50p)] to-[var(--brand-70)] opacity-100"
                        : "opacity-0 group-hover:opacity-100")
                    }
                  ></span>
                </button>
              );
            })}
            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-800 dark:border-[var(--border-grey)]">
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center w-10 h-10 text-[var(--brand-70)] hover:text-[var(--brand-60)] rounded-full focus:outline-none transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Button
                onClick={onGetStarted}
                className="bg-[var(--brand-60)] hover:bg-[var(--brand-70)] text-white px-6 py-2 rounded-full font-medium text-base transition-colors duration-200 flex items-center gap-2 shadow"
              >
                <span>Start now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 