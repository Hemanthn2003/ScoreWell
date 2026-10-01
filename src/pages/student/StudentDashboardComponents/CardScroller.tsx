import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

export const CardScroller = ({
  children,
}: {
  children: ReactNode;
}) => {
  const scrollRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    canScrollLeft,
    setCanScrollLeft,
  ] = useState(false);

  const [
    canScrollRight,
    setCanScrollRight,
  ] = useState(false);

  const dragging =
    useRef(false);

  const startX =
    useRef(0);

  const startScroll =
    useRef(0);

  const updateScrollButtons =
    useCallback(() => {
      const element =
        scrollRef.current;

      if (!element) {
        return;
      }

      const maxScroll =
        element.scrollWidth -
        element.clientWidth;

      setCanScrollLeft(
        element.scrollLeft > 2
      );

      setCanScrollRight(
        maxScroll > 2 &&
          element.scrollLeft <
            maxScroll - 2
      );
    }, []);

  useEffect(() => {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    updateScrollButtons();

    element.addEventListener(
      "scroll",
      updateScrollButtons,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateScrollButtons
    );

    const resizeObserver =
      new ResizeObserver(() => {
        updateScrollButtons();
      });

    resizeObserver.observe(
      element
    );

    return () => {
      element.removeEventListener(
        "scroll",
        updateScrollButtons
      );

      window.removeEventListener(
        "resize",
        updateScrollButtons
      );

      resizeObserver.disconnect();
    };
  }, [
    children,
    updateScrollButtons,
  ]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    if (
      element.scrollWidth <=
      element.clientWidth
    ) {
      return;
    }

    dragging.current =
      true;

    startX.current =
      event.clientX;

    startScroll.current =
      element.scrollLeft;

    element.style.scrollBehavior =
      "auto";

    element.style.cursor =
      "grabbing";

    event.preventDefault();
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!dragging.current) {
      return;
    }

    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    const distance =
      event.clientX -
      startX.current;

    element.scrollLeft =
      startScroll.current -
      distance * 1.5;

    event.preventDefault();
  };

  const stopDragging = () => {
    const element =
      scrollRef.current;

    dragging.current =
      false;

    if (element) {
      element.style.scrollBehavior =
        "smooth";

      element.style.cursor =
        "grab";
    }
  };

  const handleWheel = (
    event: React.WheelEvent<HTMLDivElement>
  ) => {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    if (
      element.scrollWidth <=
      element.clientWidth
    ) {
      return;
    }

    const horizontalDelta =
      Math.abs(event.deltaX);

    const verticalDelta =
      Math.abs(event.deltaY);

    if (
      horizontalDelta > 0 ||
      verticalDelta > 0
    ) {
      const delta =
        horizontalDelta >
        verticalDelta
          ? event.deltaX
          : event.deltaY;

      element.scrollLeft +=
        delta;
    }
  };

  const scrollCards = (
    direction:
      | "left"
      | "right"
  ) => {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    const amount =
      Math.max(
        element.clientWidth *
          0.75,
        280
      );

    element.scrollBy({
      left:
        direction === "right"
          ? amount
          : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full">

      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll cards left"
          onClick={() =>
            scrollCards("left")
          }
          className="absolute left-1 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-purple-100 bg-white text-purple-700 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-purple-50 xl:flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}

      <div
        ref={scrollRef}
        onMouseDown={
          handleMouseDown
        }
        onMouseMove={
          handleMouseMove
        }
        onMouseUp={
          stopDragging
        }
        onMouseLeave={
          stopDragging
        }
        onWheel={
          handleWheel
        }
        onDragStart={(event) =>
          event.preventDefault()
        }
        className="flex w-full gap-3 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory overscroll-x-contain py-2 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          touchAction:
            "pan-x",

          WebkitOverflowScrolling:
            "touch",

          cursor:
            canScrollLeft ||
            canScrollRight
              ? "grab"
              : "default",
        }}
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll cards right"
          onClick={() =>
            scrollCards("right")
          }
          className="absolute right-1 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-purple-100 bg-white text-purple-700 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-purple-50 xl:flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}

    </div>
  );
};