import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function isRegistrationOpen(regStartDate, regEndDate) {
  const now = new Date();
  const start = new Date(regStartDate);
  const end = new Date(regEndDate);
  return now >= start && now <= end;
}

export function getTimeUntilDate(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diffInMs = target - now;
  
  if (diffInMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
}