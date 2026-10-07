"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getImageProps } from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface BannerItem {
  desktop_url: string;
  mobile_url?: string;
  link_url?: string;
}

function BannerPicture({ banner, index }: { banner: BannerItem; index: number }) {
  const desktop = banner.desktop_url;
  const mobile  = banner.mobile_url && banner.mobile_url !== banner.desktop_url
    ? banner.mobile_url
    : banner.desktop_url;
  const priority = index === 0;
  const alt = `banner ${index + 1}`;

  const { props: desktopProps } = getImageProps({
    src: desktop, alt, width: 1600, height: 500,
    sizes: "100vw", quality: 75, priority,
  });
  const { props: mobileProps } = getImageProps({
    src: mobile, alt, width: 828, height: 460,
    sizes: "100vw", quality: 75, priority,
  });

  const inner = (
    <picture className="h-full w-full">
      <source media="(min-width: 768px)" srcSet={desktopProps.srcSet} sizes="100vw" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...mobileProps}
        alt={alt}
        fetchPriority={priority ? "high" : "low"}
        className="h-full w-full object-cover"
      />
    </picture>
  );

  if (banner.link_url) {
    return (
      <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
        {inner}
      </a>
    );
  }
  return inner;
}

interface HeroBannerProps {
  banners: BannerItem[];
  autoPlayDelay?: number;
}

export function HeroBanner({ banners, autoPlayDelay = 5000 }: HeroBannerProps) {
  const autoplay = useRef(Autoplay({ delay: autoPlayDelay, stopOnInteraction: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [autoplay.current]
  );
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
    emblaApi.on("select", () => setCurrent(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const multi = banners.length > 1;

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => autoplay.current.stop()}
      onMouseLeave={() => autoplay.current.reset()}
    >
      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((banner, i) => (
            <div
              key={i}
              className="relative min-w-0 shrink-0 grow-0 basis-full"
            >
              <div className="relative aspect-[9/5] w-full overflow-hidden md:aspect-[16/5]">
                <BannerPicture banner={banner} index={i} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      {multi && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 md:h-10 md:w-10"
            aria-label="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 md:h-10 md:w-10"
            aria-label="Next slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {multi && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 rounded-full bg-white transition-all duration-300 ${
                current === i ? "w-7 opacity-100" : "w-2 opacity-50 hover:opacity-75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
