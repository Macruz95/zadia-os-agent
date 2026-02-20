"use client";

import React, { useEffect, useState } from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------
// Animated Card (Hover Glow + Staggered Entrance)
// ----------------------------------------------------------------------
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    delay?: number;
    glowColor?: "primary" | "accent" | "danger" | "warning" | "success" | "info";
}

export function AnimatedCard({
    children,
    className,
    delay = 0,
    glowColor = "primary",
    ...props
}: AnimatedCardProps) {
    const glowClasses = {
        primary: "hover:shadow-[var(--zadia-shadow-glow)] border-[var(--zadia-border)] hover:border-primary/50",
        accent: "hover:shadow-[var(--zadia-shadow-glow-accent)] border-[var(--zadia-border)] hover:border-accent/50",
        danger: "hover:shadow-[0_0_20px_hsl(var(--zadia-danger)/0.3)] border-[var(--zadia-border)] hover:border-destructive/50",
        warning: "hover:shadow-[0_0_20px_hsl(var(--zadia-warning)/0.3)] border-[var(--zadia-border)] hover:border-warning/50",
        success: "hover:shadow-[0_0_20px_hsl(var(--zadia-success)/0.3)] border-[var(--zadia-border)] hover:border-success/50",
        info: "hover:shadow-[0_0_20px_hsl(var(--zadia-info)/0.3)] border-[var(--zadia-border)] hover:border-cyan-500/50",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
                delay: delay * 0.1,
            }}
            className={cn(
                "bg-card text-card-foreground rounded-xl border transition-all duration-300",
                glowClasses[glowColor],
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// Staggered List Wrapper
// ----------------------------------------------------------------------
const listVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export function StaggerList({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {React.Children.map(children, (child) => (
                <motion.div variants={itemVariants}>{child}</motion.div>
            ))}
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// Animated Number (Counting up)
// ----------------------------------------------------------------------
export function AnimatedNumber({
    value,
    duration = 1.5,
    format = (val) => Math.round(val).toString(),
    className,
}: {
    value: number;
    duration?: number;
    format?: (val: number) => string;
    className?: string;
}) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTimestamp: number;
        const endValue = value;

        // Quick skip if value is 0 or no animation needed
        if (endValue === 0) {
            setDisplayValue(0);
            return;
        }

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);

            // Easing function: easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);

            setDisplayValue(easeProgress * endValue);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayValue(endValue);
            }
        };

        window.requestAnimationFrame(step);
    }, [value, duration]);

    return <span className={className}>{format(displayValue)}</span>;
}

// ----------------------------------------------------------------------
// Animated Badge (Pulse on render or attention)
// ----------------------------------------------------------------------
export function AnimatedBadge({
    children,
    className,
    pulse = false,
}: {
    children: React.ReactNode;
    className?: string;
    pulse?: boolean;
}) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn("inline-flex items-center", className)}
        >
            {children}
            {pulse && (
                <span className="absolute -inset-1 rounded-full animate-ping bg-current opacity-20" />
            )}
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// Animated Section (Fade in + slide up)
// ----------------------------------------------------------------------
export function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
                delay: delay,
            }}
            className={className}
        >
            {children}
        </motion.section>
    );
}

// ----------------------------------------------------------------------
// Animated Page (Page entry wrapper)
// ----------------------------------------------------------------------
export function AnimatedPage({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

