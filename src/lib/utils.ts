import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  if (!dateString.includes("T")) {
    dateString = `${dateString}T00:00:00`;
  }

  const timeZone = 'America/Los_Angeles';

  const targetDate = new Date(dateString);
  const targetDateInPacific = new Date(
    targetDate.toLocaleString('en-US', { timeZone })
  );

  const now = new Date();
  const nowInPacific = new Date(
    now.toLocaleString('en-US', { timeZone })
  );
  const timeDifference = nowInPacific.getTime() - targetDateInPacific.getTime();
  const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const fullDate = targetDateInPacific.toLocaleString('en-US', {
    timeZone,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (daysAgo < 1) {
    return "Today";
  } else if (daysAgo < 7) {
    return `${fullDate} (${daysAgo}d ago)`;
  } else if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7);
    return `${fullDate} (${weeksAgo}w ago)`;
  } else if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30);
    return `${fullDate} (${monthsAgo}mo ago)`;
  } else {
    const yearsAgo = Math.floor(daysAgo / 365);
    return `${fullDate} (${yearsAgo}y ago)`;
  }
}
