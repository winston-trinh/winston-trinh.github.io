import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/navbar";
import ThemeScript from "@/components/ui/theme";

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <ThemeScript />
        <ThemeProvider attribute="class" defaultTheme="system">
          <TooltipProvider delayDuration={0}>
            {children}
            <Navbar />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
