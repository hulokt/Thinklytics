import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import '../styles/AnimatedList.css';

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      style={{ marginBottom: '1rem', cursor: 'pointer' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedList = ({
  items = [],
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  selectedItems = new Set(), // New prop for selection state
  disabled = false, // New prop to disable interactions
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10); // Start with 10 items on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset visible count when items change
  useEffect(() => {
    setVisibleCount(10);
  }, [items]);

  // Update selected index when initialSelectedIndex changes
  useEffect(() => {
    setSelectedIndex(initialSelectedIndex);
  }, [initialSelectedIndex]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
    );
  };

  const loadMoreItems = () => {
    setVisibleCount(prev => Math.min(prev + 10, items.length));
  };

  const showAllItems = () => {
    setVisibleCount(items.length);
  };

  // Get items to display based on mobile/desktop and visible count
  const itemsToShow = isMobile ? items.slice(0, visibleCount) : items;
  const hasMoreItems = isMobile && visibleCount < items.length;

  useEffect(() => {
    if (!enableArrowNavigation || !isFocused) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setHoveredIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setHoveredIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (hoveredIndex >= 0 && hoveredIndex < items.length) {
          e.preventDefault();
          setSelectedIndex(hoveredIndex);
          if (onItemSelect) {
            onItemSelect(items[hoveredIndex], hoveredIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, hoveredIndex, onItemSelect, enableArrowNavigation, isFocused]);

  useEffect(() => {
    if (!keyboardNav || hoveredIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const hoveredItem = container.querySelector(`[data-index="${hoveredIndex}"]`);
    if (hoveredItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = hoveredItem.offsetTop;
      const itemBottom = itemTop + hoveredItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth',
        });
      }
    }
    setKeyboardNav(false);
  }, [hoveredIndex, keyboardNav]);

  return (
    <div className={`scroll-list-container ${className}`}>
      <div
        ref={listRef}
        className={`scroll-list ${!displayScrollbar ? 'no-scrollbar' : ''}`}
        onScroll={handleScroll}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsFocused(true)}
        onMouseLeave={() => {
          setIsFocused(false);
          setHoveredIndex(-1);
        }}
        tabIndex={0}
      >
        {itemsToShow.map((item, index) => {
          const isSelected = selectedItems.has(index);
          return (
            <AnimatedItem
              key={index}
              delay={0.1}
              index={index}
              onMouseEnter={() => !disabled && setHoveredIndex(index)}
              onClick={() => {
                if (disabled) return;
                setSelectedIndex(index);
                if (onItemSelect) {
                  onItemSelect(item, index);
                }
              }}
            >
              <div className={`item ${selectedIndex === index ? 'selected' : ''} ${hoveredIndex === index ? 'hovered' : ''} ${isSelected ? 'bulk-selected' : ''} ${itemClassName}`}>
                <p className="item-text">{item}</p>
              </div>
            </AnimatedItem>
          );
        })}
        
        {/* Load More Button for Mobile */}
        {hasMoreItems && (
          <div className="flex flex-col gap-2 mt-4 p-2">
            <button
              onClick={loadMoreItems}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              Load More Questions ({Math.min(10, items.length - visibleCount)} more)
            </button>
            <button
              onClick={showAllItems}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 text-xs"
            >
              Show All ({items.length} total)
            </button>
          </div>
        )}
      </div>
      {showGradients && (
        <>
          <div
            className="top-gradient"
            style={{ opacity: topGradientOpacity }}
          ></div>
          <div
            className="bottom-gradient"
            style={{ opacity: bottomGradientOpacity }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList; 