"use client";
import { cn } from "../../lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import logoImage from "/logo.png";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children, open: openProp, setOpen: setOpenProp, animate = true }) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, open, setOpen, animate }) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden md:flex md:flex-col flex-shrink-0 transition-all duration-300 relative group",
          "bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950",
          "border-r border-gray-800/50",
          "shadow-xl shadow-black/20",
          className
        )}
        animate={{
          width: animate ? (open ? 240 : 80) : 240,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        {...props}
      >
        {/* Toggle button - positioned absolutely */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "absolute -right-3 top-6 z-50",
            "w-6 h-6 rounded-full",
            "bg-gradient-to-br from-blue-500 to-blue-600",
            "shadow-lg shadow-blue-500/50",
            "flex items-center justify-center",
            "hover:shadow-xl hover:shadow-blue-500/60",
            "hover:scale-110",
            "transition-all duration-200",
            "border border-gray-800"
          )}
        >
          {open ? (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
        
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 py-2 flex flex-row md:hidden items-center justify-between bg-gray-900 border-b border-gray-700 w-full flex-shrink-0 transition-colors duration-300"
        )}
      >
        {/* Logo for mobile */}
        <div className="flex items-center space-x-2">
          <img src={logoImage} alt="Thinklytics Logo" className="w-8 h-8 rounded-lg object-cover brightness-0 invert" />
          <span className="ml-2 text-lg font-bold text-white">Thinklytics</span>
        </div>
        
        <div className="flex justify-end z-20">
          <button
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-700 transition-colors duration-200"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg
              className="text-gray-300 w-5 h-5 transition-colors duration-300"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-gray-900 p-4 z-[100] flex flex-col justify-between overflow-hidden transition-colors duration-300",
                className
              )}
              {...props}
            >
              <div
                className="absolute right-4 top-4 z-50 text-gray-300 transition-colors duration-300"
                onClick={() => setOpen(!open)}
              >
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-700 transition-colors duration-200"
                  aria-label="Close menu"
                >
                  <svg
                    className="h-5 w-5"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="m6 18 12-12M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-16 pb-4 flex flex-col justify-between">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({ link, className, ...props }) => {
  const { open, animate } = useSidebar();
  return (
    <div
      className={cn(
        "flex items-center group/sidebar py-3 px-3 cursor-pointer rounded-xl",
        "relative overflow-hidden",
        // Smooth hover transitions
        "transition-all duration-300 ease-out",
        "transition-colors",
        // Background and shadow on hover
        "hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10",
        "hover:shadow-lg hover:shadow-blue-500/5",
        // Border accent
        "border border-transparent hover:border-blue-500/20",
        open ? "justify-start gap-3" : "justify-center",
        className
      )}
      {...props}
    >
      {/* Icon with gradient on hover */}
      <div className={cn(
        "relative z-10",
        // Smooth icon color and scale
        "transition-all duration-300 ease-out",
        "transition-colors",
        "text-gray-400 group-hover/sidebar:text-blue-400",
        "group-hover/sidebar:scale-110",
        !open && "group-hover/sidebar:scale-125"
      )}>
        {link.icon}
      </div>

      {/* Label with animation */}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-gray-300 text-sm font-medium whitespace-pre inline-block !p-0 !m-0 relative z-10",
          // Smooth label color and position
          "transition-all duration-300 ease-out",
          "transition-colors",
          "group-hover/sidebar:text-white",
          "group-hover/sidebar:translate-x-0.5"
        )}
      >
        {link.label}
      </motion.span>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ease-out" />
    </div>
  );
}; 