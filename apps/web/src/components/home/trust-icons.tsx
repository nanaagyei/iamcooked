import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function OsvIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect width="24" height="24" rx="6" fill="#34A853" />
      <path
        fill="#fff"
        d="M6.5 7.5h2.2v9H6.5v-9Zm3.4 0h2v9h-2v-9Zm4.2 0c2.1 0 3.5 1.4 3.5 3.6v1.8c0 2.2-1.4 3.6-3.5 3.6-2.1 0-3.5-1.4-3.5-3.6v-1.8c0-2.2 1.4-3.6 3.5-3.6Zm0 1.8c-.9 0-1.4.6-1.4 1.8v1.8c0 1.2.5 1.8 1.4 1.8.9 0 1.4-.6 1.4-1.8v-1.8c0-1.2-.5-1.8-1.4-1.8Z"
      />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function CisaIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect width="24" height="24" rx="6" fill="#005288" />
      <path
        fill="#fff"
        d="M5.5 7h2v10h-2V7Zm4 0h6.5c2.8 0 4.7 1.7 4.7 4.4v1.2c0 2.7-1.9 4.4-4.7 4.4H9.5V7Zm2 2v6h4.2c1.5 0 2.4-.9 2.4-2.4v-1.2c0-1.5-.9-2.4-2.4-2.4h-4.2Z"
      />
    </svg>
  );
}

export function NvdIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect width="24" height="24" rx="6" fill="#2F4A68" />
      <path
        fill="#fff"
        d="M5.5 7h2.2v10H5.5V7Zm4.5 0h2.2l4.8 6.6V7h2v10h-2.2l-4.8-6.6V17h-2V7Zm10.2 0c2.7 0 4.6 1.8 4.6 4.5v1c0 2.7-1.9 4.5-4.6 4.5h-4.4V7h4.4Zm0 2h-2v6h2c1.5 0 2.4-.9 2.4-2.5v-1c0-1.6-.9-2.5-2.4-2.5Z"
      />
    </svg>
  );
}

export function NpmIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect width="24" height="24" rx="4" fill="#CB3837" />
      <path fill="#fff" d="M6 17V7h3.5l.5 3.5h2.5V7H15v10h-3.5l-.5-3.5H9V17H6Z" />
    </svg>
  );
}

export function SnykIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 2 4 18h3.5l1.2-2.6h6.6L16.5 18H20L12 2Zm0 5.8 2 4.4h-4l2-4.4Z"
      />
    </svg>
  );
}

export function VendorIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.12" />
      <path
        fill="currentColor"
        d="M7 8h10v1.6H7V8Zm0 3.2h10v1.6H7v-1.6Zm0 3.2h6.5v1.6H7v-1.6Z"
      />
    </svg>
  );
}
