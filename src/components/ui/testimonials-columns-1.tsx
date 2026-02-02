"use client";
import React from "react";
import { motion } from "framer-motion";
import { Testimonial } from "@/data/testimonials";

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {/* Create two sets of testimonials for infinite scrolling effect */}
        {[...new Array(2)].map((_, index) => (
          <div key={`testimonial-set-${index}`} className="contents">
            {props.testimonials.map(({ id, text, image, name, role, company }, i) => {
              const key = `testimonial-${index}-${i}`;
              // Cycle through subtle background styles based on index
              const cardStyles = [
                "bg-white dark:bg-card/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                "bg-[var(--color-secondary)]/5 dark:bg-card/20 shadow-sm border border-[var(--color-secondary)]/10",
                "bg-[var(--color-primary)]/5 dark:bg-card/20 shadow-sm"
              ];
              const cardClass = cardStyles[i % 3];

              return (
                <div
                  key={key}
                  className={`p-6 md:p-8 rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all duration-300 ${cardClass} w-full max-w-xs`}
                >
                  <span className="absolute -top-4 -left-2 text-7xl text-[var(--color-primary)]/5 dark:text-white/5 font-serif select-none italic font-bold leading-none">
                    “
                  </span>

                  <p className="font-playfair text-lg md:text-xl italic leading-relaxed text-foreground mb-8 relative z-10">
                    "{text}"
                  </p>

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full border-2 border-[var(--color-primary)]/10 overflow-hidden flex-shrink-0">
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">
                        {name}
                      </h4>
                      <p className="text-muted-foreground text-xs font-medium">
                        {role}{company ? `, ${company}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </motion.div>
    </div>
  );
};