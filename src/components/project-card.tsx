import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import React from "react";

export interface ProjectLink {
  readonly type: string;
  readonly href: string;
  readonly icon: React.ReactNode;
}

export interface Project {
  readonly title: string;
  readonly href?: string;
  readonly dates: string;
  readonly active?: boolean;
  readonly description: string;
  readonly technologies: readonly string[];
  readonly links?: readonly ProjectLink[];
  readonly image?: string;
  readonly video?: string;
}


export function ProjectCard({
  title,
  href,
  description,
  dates,
  technologies,
  image,
  video,
  links,
}: Project) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href) {
      event.preventDefault();
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full">
      <Link
        href={href || ""}
        className="block cursor-pointer"
        target={href ? "_blank" : undefined}
        rel={href ? "noopener noreferrer" : undefined}
        onClick={handleClick}
      >
        {video && (
          <video
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className="pointer-events-none mx-auto h-40 w-full object-cover object-top"
          />
        )}
        {image && (
          <Image
            src={image}
            alt={title}
            width={500}
            height={300}
            className="h-40 w-full overflow-hidden object-cover object-top"
          />
        )}
      </Link>
      <CardHeader className="px-2">
        <div className="space-y-1">
          <CardTitle className="mt-1 text-base">{title}</CardTitle>
          <time className="font-sans text-xs">{dates}</time>
          <div className="hidden font-sans text-xs underline print:visible">
            {href?.replace("https://", "").replace("www.", "").replace("/", "")}
          </div>
          <Markdown className="prose max-w-full text-pretty font-sans text-xs text-muted-foreground dark:prose-invert">
            {description}
          </Markdown>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col px-2">
        {technologies && technologies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {technologies.map((tech) => (
              <Badge
                className="px-1 py-0 text-[10px]"
                variant="secondary"
                key={tech}
              >
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      {links && links.length > 0 && (
        <CardFooter className="px-2 pb-2">
          <div className="flex flex-row flex-wrap items-start gap-1">
            {links.map((linkItem, idx) => (
              <Link href={linkItem.href} key={idx} target="_blank">
                <Badge className="flex gap-2 px-2 py-1 text-[10px]">
                  {linkItem.icon}
                  {linkItem.type}
                </Badge>
              </Link>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
