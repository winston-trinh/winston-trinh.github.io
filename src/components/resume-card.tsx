"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";
import React from 'react';
import Link from "next/link";

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  description?: React.ReactNode;
}

export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
}: ResumeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Track when the component is mounted

  useEffect(() => {
    setIsMounted(true); // Set to true when the component is mounted
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (description) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Link
      href={href || "#"}
      className="block cursor-pointer"
      onClick={handleClick}
    >
      <Card className="flex">
        <div className="flex-none">
          <Avatar className="border size-10 sm:size-14 m-auto bg-muted-background dark:bg-foreground">
            <AvatarImage
              src={logoUrl}
              alt={altText}
              className="object-contain"
            />
            <AvatarFallback>{altText[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-grow ml-4 items-center flex-col group">
          <CardHeader>
            <div className="flex items-center justify-between gap-x-2 text-sm">
              <h3 className="inline-flex items-center justify-center font-semibold leading-none text-[8px] sm:text-lg">
                {title}
                {badges && (
                  <span className="inline-flex gap-x-1">
                    {badges.map((badge, index) => (
                      <Badge
                        variant="secondary"
                        className="align-middle text-xs"
                        key={index}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </span>
                )}
                <ChevronRightIcon
                  className={cn(
                    "size-2 sm:size-4 transform duration-300 ease-out ml-4",
                    isExpanded ? "rotate-90" : "rotate-0",
                    "opacity-100"
                  )}
                />
              </h3>
              <div className="text-[7px] sm:text-sm tabular-nums text-muted-foreground text-right">
                {period}
              </div>
            </div>
            {subtitle && <div className="font-sans text-[8px] sm:text-base">{subtitle}</div>}
          </CardHeader>
          {isMounted && description && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isExpanded ? 1 : 0,
                height: isExpanded ? "auto" : 0,
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-2 text-[8px] sm:text-sm"
            >
              {description}
              {href && href !== "#" && (
                <Link
                  href={href}
                  className="underline text-[#1d97d8] hover:text-[#1376ab]"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Link
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </Card>
    </Link>
  );
};
