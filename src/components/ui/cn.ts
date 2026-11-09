import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['large-title', 'title-1', 'title-2', 'title-3', 'headline', 'body', 'callout', 'subheadline', 'footnote', 'caption', 'numeric'],
      spacing: ['control-sm', 'control-md', 'control-lg', 'touch', 'sidebar', 'header'],
      container: ['content'],
      radius: ['card', 'dialog', 'sig'],
      shadow: ['1', '2', '3', '4', 'brand', 'focus'],
      ease: ['standard', 'spring'],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
