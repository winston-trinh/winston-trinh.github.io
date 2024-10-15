"use client";

import { HackathonCard } from "@/components/hackathon-card";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Project } from "@/components/project-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DATA } from "@/data/resume";
import Link from "next/link";
import React from 'react';
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LinkRendererProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  children?: React.ReactNode;
}

const smoothScroll = (targetElement: Element, duration: number) => {
  const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
    if (Math.abs(run - window.scrollY) > 1) {
      window.scrollTo(0, run);
    }
    if (timeElapsed < duration) requestAnimationFrame(animation);
  };
  

  requestAnimationFrame(animation);
};

const easeInOutCubic = (t: number, b: number, c: number, d: number) => {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t * t + b;
  t -= 2;
  return (c / 2) * (t * t * t + 2) + b;
};


// Custom LinkRenderer to make links open in a new tab
const LinkRenderer = (props: LinkRendererProps) => {
  const { href = '', children, ...rest } = props;
  const isInternalLink = href.startsWith("/") || href.startsWith("#");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      e.preventDefault(); // Prevent default link behavior

      // Smooth scroll to the element with the corresponding ID
      const targetElement = document.querySelector(href);
      if (targetElement) {
        smoothScroll(targetElement, 1500);
        
        // Update the URL hash
        window.location.hash = href;
      }
    }
  };

  return (
    <a
      href={href}
      onClick={isInternalLink && href.startsWith("#") ? handleClick : undefined}
      target={isInternalLink ? "_self" : "_blank"}
      rel={isInternalLink ? "" : "noopener noreferrer"}
      {...rest}
    >
      {children}
    </a>
  );
};
const Summary = () => {
  return (
    <div className="prose max-w-full text-pretty font-sans text-sm md:text-xl text-muted-foreground dark:prose-invert">
      {DATA.summary.map((paragraph, index) => (
        <Markdown
          key={index}
          remarkPlugins={[remarkGfm]} // Supports GitHub Flavored Markdown (GFM)
          components={{
            a: LinkRenderer,
          }}
        >
          {paragraph}
        </Markdown>
      ))}
    </div>
  );
};

const BLUR_FADE_DELAY = 0.04;

export default function Page() {
  const handleArrowClickToEducation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const targetElement = document.querySelector('#education');
    if (targetElement) {
      smoothScroll(targetElement, 1500);
    }
  };

  const handleArrowClickToProjects = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const targetElement = document.querySelector('#projects');
    if (targetElement) {
      smoothScroll(targetElement, 1500);
    }
  };

  return (
    <main className="flex flex-col min-h-[100dvh]">
      <section className="flex flex-col min-h-screen">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex gap-2">
            <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0">
              <div className="flex flex-col space-y-1.5">
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-5xl/none"
                  yOffset={8}
                  text={`Hi, I'm ${DATA.name.split(" ")[0]} 👋`}
                />
                <BlurFadeText
                  className="max-w-[600px] md:text-xl"
                  delay={BLUR_FADE_DELAY}
                  text={DATA.description}
                />
              </div>
              <BlurFade delay={BLUR_FADE_DELAY}>
                <Avatar className="w-48 h-48 sm:w-40 sm:h-40 border mt-4 sm:mt-0">
                  <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                  <AvatarFallback>{DATA.initials}</AvatarFallback>
                </Avatar>
              </BlurFade>
            </div>
          </div>
          <section id="skills">
            <div className="flex min-h-0 flex-col mt-8 gap-y-3">
              <BlurFade delay={BLUR_FADE_DELAY * 9}>
                <h2 className="text-xl font-bold">Skills</h2>
              </BlurFade>
              <div className="flex flex-wrap gap-1">
                {DATA.skills.map((skill, id) => (
                  <BlurFade key={skill} delay={BLUR_FADE_DELAY * 10 + id * 0.05}>
                    <Badge key={skill}>{skill}</Badge>
                  </BlurFade>
                ))}
              </div>
            </div>
          </section>
          <div className="flex flex-col mt-8">
            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <h2 className="text-xl font-bold">About</h2>
            </BlurFade>
            <BlurFade delay={BLUR_FADE_DELAY * 4}>
              <Summary />
            </BlurFade>
          </div>
          <BlurFade delay={BLUR_FADE_DELAY * 10}>
            <div className="flex justify-center mt-24 sm:mt-24 md:mt-2">
              <div
                onClick={handleArrowClickToEducation}
                className="cursor-pointer text-muted-foreground hover:text-primary transition duration-200"
              >
                <div className="w-16 h-16 rounded-full border border-muted-foreground flex items-center justify-center hover:bg-primary hover:text-background">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 animate-bounce"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
	        </BlurFade>
        </div>
      </section>
      <section id="education" className="flex flex-col min-h-screen pt-16">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <h2 className="text-xl font-bold">Education</h2>
          </BlurFade>
          {DATA.education.map((education, id) => (
            <BlurFade
              key={education.school}
              delay={BLUR_FADE_DELAY * 8 + id * 0.05}
            >
              <ResumeCard
                key={education.school}
                href={education.href}
                logoUrl={education.logoUrl}
                altText={education.school}
                title={education.school}
                subtitle={education.degree}
                period={`${education.end}`}
                // period={`${education.start} - ${education.end}`}
                description={
                  <ul>
                    {education.description.map((desc, index) => (
                      <li key={index} style={{ marginBottom: "10px" }}>
                        {desc}
                      </li>
                    ))}
                  </ul>
                }
              />
            </BlurFade>
          ))}
        </div>
        <section id="work" className="pt-12">
          <div className="flex min-h-0 flex-col gap-y-3">
            <BlurFade delay={BLUR_FADE_DELAY * 5}>
              <h2 className="text-xl font-bold">Work Experience</h2>
            </BlurFade>
            {DATA.work.map((work, id) => (
              <BlurFade
                key={work.company}
                delay={BLUR_FADE_DELAY * 6 + id * 0.05}
              >
                <ResumeCard
                  key={work.company}
                  logoUrl={work.logoUrl}
                  altText={work.company}
                  title={work.company}
                  subtitle={work.title}
                  href={work.href}
                  badges={work.badges}
                  period={`${work.start} - ${work.end ?? "Present"}`}
                  description={
                    <ul>
                      {work.description.map((desc, index) => (
                        <li key={index} style={{ marginBottom: "10px" }}>
                          {desc}
                        </li>
                      ))}
                    </ul>
                  }
                />
              </BlurFade>
            ))}
          </div>
        </section>
        <BlurFade delay={BLUR_FADE_DELAY * 10}>
          <div className="flex justify-center sm:mt-6 md:mt-8">
            <div
              onClick={handleArrowClickToProjects}
              className="cursor-pointer text-muted-foreground hover:text-primary transition duration-200"
            >
              <div className="w-16 h-16 rounded-full border border-muted-foreground flex items-center justify-center hover:bg-primary hover:text-background">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </BlurFade>
      </section>
      <section id="projects">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  Projects
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Check out my latest work
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  I&apos;ve worked on a variety of projects, from simple
                  websites to complex full-stack applications. Here are a few of my
                  favorites.
                </p>
              </div>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto">
            {DATA.projects.map((project: Project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
              >
                <ProjectCard
                  href={project.href}
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  dates={project.dates}
                  technologies={project.technologies}
                  image={project.image}
                  video={project.video}
                  links={project.links}
                />
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      {/* <section id="hackathons">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 13}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  Hackathons
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  I like building things
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  During my time in university, I attended{" "}
                  {DATA.hackathons.length}+ hackathons. People from around the
                  country would come together and build incredible things in 2-3
                  days. It was eye-opening to see the endless possibilities
                  brought to life by a group of motivated and passionate
                  individuals.
                </p>
              </div>
            </div>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 14}>
            <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
              {DATA.hackathons.map((project, id) => (
                <BlurFade
                  key={project.title + project.dates}
                  delay={BLUR_FADE_DELAY * 15 + id * 0.05}
                >
                  <HackathonCard
                    title={project.title}
                    description={project.description}
                    location={project.location}
                    dates={project.dates}
                    image={project.image}
                    links={project.links}
                  />
                </BlurFade>
              ))}
            </ul>
          </BlurFade>
        </div>
      </section> */}
      <section id="contact">
        <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                Contact
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Get in Touch
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Want to chat? Just shoot me a {" "}
                <Link
                  href={"mailto:wntrinh@usc.edu"}
                  className="text-blue-500 hover:underline"
                >
                  email
                </Link>{" "}
                and I&apos;ll respond whenever I can.
              </p>
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}
