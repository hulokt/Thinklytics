"use client";

import { cn } from "../../lib/utils";
import React, { useEffect, useState, useRef } from "react";
import { Star } from "lucide-react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}) => {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "60s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "120s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "180s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => {
          const isString = typeof item === 'string';
          const isTestimonial = typeof item === 'object' && item.quote;
          const key = isString ? idx : item.name || idx;

          if (isString) {
            return (
              <li
                className="w-auto max-w-full relative rounded-2xl border-b-0 flex-shrink-0 px-8 py-6"
                key={key}
              >
                <blockquote className="flex items-center justify-center h-full">
                  <span className="relative z-20 text-lg sm:text-xl leading-[1.6] text-gray-400 dark:text-slate-500 font-bold tracking-wider">
                    {item}
                  </span>
                </blockquote>
              </li>
            );
          }

          if (isTestimonial) {
            return (
              <li
                className="w-[400px] max-w-full relative rounded-2xl border border-b-0 flex-shrink-0 border-gray-200 dark:border-white/10 px-10 py-8 md:w-[500px] bg-white dark:bg-white/5 backdrop-blur-sm shadow-lg"
                key={key}
              >
                <blockquote>
                  <div className="flex gap-1 mb-3">
                    {Array(item.stars)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-amber-500 fill-amber-500"
                        />
                      ))}
                  </div>
                  <span className="relative z-20 text-base leading-[1.7] text-gray-700 dark:text-gray-200 font-normal">
                    {item.quote}
                  </span>
                  <div className="relative z-20 mt-8 flex flex-row items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base">
                      {item.avatar}
                    </div>
                    <span className="flex flex-col gap-1 ml-4">
                      <span className="text-base leading-[1.6] text-gray-800 dark:text-gray-100 font-medium">
                        {item.name}
                      </span>
                      <span className="text-sm leading-[1.6] text-gray-600 dark:text-gray-400 font-normal">
                        {item.title}
                      </span>
                    </span>
                  </div>
                </blockquote>
              </li>
            );
          }
          
          return null;
        })}
      </ul>
    </div>
  );
}; 