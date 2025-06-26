"use client";
import { cn } from "../../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
          "h-full px-4 py-4 hidden md:flex md:flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-[300px] flex-shrink-0 transition-colors duration-300",
          className
        )}
        animate={{
          width: animate ? (open ? 300 : 80) : "300px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
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
          "h-14 px-4 py-2 flex flex-row md:hidden items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 w-full flex-shrink-0 transition-colors duration-300"
        )}
      >
        {/* Logo for mobile */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
            <div className="h-5 w-5 bg-white rounded-md flex items-center justify-center">
              <div className="h-2.5 w-2.5 bg-blue-600 rounded-sm"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-800 dark:text-white leading-none transition-colors duration-300">
              Redomind
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 leading-none transition-colors duration-300">
              Study Platform
            </span>
          </div>
        </div>
        
        <div className="flex justify-end z-20">
          <button
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg
              className="text-gray-700 dark:text-gray-300 w-5 h-5 transition-colors duration-300"
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
                "fixed h-full w-full inset-0 bg-white dark:bg-gray-800 p-4 z-[100] flex flex-col justify-between overflow-hidden transition-colors duration-300",
                className
              )}
              {...props}
            >
              <div
                className="absolute right-4 top-4 z-50 text-gray-700 dark:text-gray-300 transition-colors duration-300"
                onClick={() => setOpen(!open)}
              >
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
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
        "flex items-center group/sidebar py-2 cursor-pointer",
        open ? "justify-start gap-2" : "justify-center",
        className
      )}
      {...props}
    >
      {link.icon}

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-gray-700 dark:text-gray-300 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </div>
  );
}; 