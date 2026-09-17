export function createSidebarLogo(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'sidebar-header';

  container.innerHTML = `
    <div class="sidebar-logo-icon" aria-hidden="true">
      <svg class="logo-svg" viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="logoShadow" x="6" y="38" width="32" height="10" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feGaussianBlur stdDeviation="2"/>
          </filter>
          <linearGradient id="pinGrad" x1="8" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#2563eb" />
            <stop offset="100%" stop-color="#0b57d0" />
          </linearGradient>
        </defs>
        <!-- Ground soft shadow -->
        <ellipse cx="22" cy="43" rx="11" ry="2.5" fill="#bfdbfe" opacity="0.8" filter="url(#logoShadow)" />
        <!-- Pin Marker Body -->
        <path d="M22 3.5C13.5 3.5 6.5 10.5 6.5 19C6.5 29.5 22 41 22 41C22 41 37.5 29.5 37.5 19C37.5 10.5 30.5 3.5 22 3.5Z" fill="url(#pinGrad)" />
        <!-- Airplane silhouette rotated inside pin -->
        <g transform="translate(22, 18.5) rotate(-35) translate(-12, -12) scale(1)">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="#ffffff"/>
        </g>
      </svg>
    </div>
    <div class="sidebar-logo-text">
      <h1 class="sidebar-brand-name">Tourisma</h1>
      <span class="sidebar-brand-tagline">Tourism Intelligence Dashboard</span>
    </div>
  `;

  return container;
}
