import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume", // This will populate your template in the browser tab
};

export default function ResumePage() {
  return (
    <div className="h-screen w-full bg-background">
      <iframe
        src="/resume_winston_trinh.pdf"
        className="h-full w-full border-0"
        title="Resume"
      />
    </div>
  );
}
