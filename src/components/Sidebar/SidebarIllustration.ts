export function createSidebarIllustration(): HTMLElement {
  const card = document.createElement('div');
  card.className = 'sidebar-illustration-card';

  card.innerHTML = `
    <svg class="illustration-svg" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <!-- Sky Gradient -->
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#f0f6ff" />
          <stop offset="60%" stop-color="#e0edfd" />
          <stop offset="100%" stop-color="#d4e6fb" />
        </linearGradient>

        <!-- Mountain Gradients -->
        <linearGradient id="distantMountain" x1="0" y1="50" x2="0" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#8ba8db" />
          <stop offset="100%" stop-color="#6488cb" />
        </linearGradient>

        <linearGradient id="midMountain" x1="0" y1="65" x2="0" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#557cbf" />
          <stop offset="100%" stop-color="#3b63a9" />
        </linearGradient>

        <linearGradient id="foreHill" x1="0" y1="90" x2="0" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#2a5298" />
          <stop offset="100%" stop-color="#193b77" />
        </linearGradient>

        <linearGradient id="frontHills" x1="0" y1="105" x2="0" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#1b448a" />
          <stop offset="100%" stop-color="#0f2b5c" />
        </linearGradient>
      </defs>

      <!-- Background Sky -->
      <rect width="240" height="140" rx="14" fill="url(#skyGrad)" />

      <!-- Soft Clouds -->
      <path d="M68 62C71 58 76 58 79 61C82 59 87 60 88 64C91 64 93 66 93 69H64C64 66 66 63 68 62Z" fill="#ffffff" opacity="0.85" />
      <path d="M125 54C128 51 133 51 136 53C138 52 142 53 143 56C145 56 147 58 147 60H121C121 57 123 55 125 54Z" fill="#ffffff" opacity="0.75" />

      <!-- Distant Mountain Peak (Left & Center) -->
      <path d="M-10 140L-10 95C25 75 45 65 65 72C90 80 120 100 155 90C190 80 215 88 250 96L250 140Z" fill="url(#distantMountain)" />

      <!-- Midground Mountain Ridge -->
      <path d="M-10 140L-10 105C30 92 65 88 95 102C125 116 160 112 195 96C220 84 235 88 250 94L250 140Z" fill="url(#midMountain)" />

      <!-- Foreground Left Hill -->
      <path d="M-10 140L-10 115C20 108 50 106 80 118C110 130 140 132 170 125L170 140Z" fill="url(#foreHill)" />

      <!-- Foreground Right Hill & Center Wave -->
      <path d="M50 140C90 122 135 122 175 130C205 136 225 132 250 120L250 140Z" fill="url(#frontHills)" />

      <!-- Pine Trees - Left -->
      <!-- Tree 1 -->
      <polygon points="26,108 22,118 30,118" fill="#1b3d75" />
      <polygon points="26,114 20,125 32,125" fill="#1b3d75" />
      <polygon points="26,121 18,133 34,133" fill="#1b3d75" />
      <rect x="25" y="133" width="2" height="4" fill="#0f264e" />

      <!-- Tree 2 -->
      <polygon points="38,102 34,113 42,113" fill="#254e94" />
      <polygon points="38,109 32,121 44,121" fill="#254e94" />
      <polygon points="38,117 30,130 46,130" fill="#254e94" />
      <rect x="37" y="130" width="2" height="4" fill="#143261" />

      <!-- Pine Trees - Right -->
      <!-- Tree 3 -->
      <polygon points="162,110 158,120 166,120" fill="#16376d" />
      <polygon points="162,116 156,127 168,127" fill="#16376d" />
      <polygon points="162,123 154,135 170,135" fill="#16376d" />
      <rect x="161" y="135" width="2" height="3" fill="#0c2042" />

      <!-- Tree 4 -->
      <polygon points="174,106 170,117 178,117" fill="#1c4484" />
      <polygon points="174,113 168,124 180,124" fill="#1c4484" />
      <polygon points="174,120 166,132 182,132" fill="#1c4484" />
      <rect x="173" y="132" width="2" height="3" fill="#0e264d" />

      <!-- Hot Air Balloon (Upper Right) -->
      <g transform="translate(172, 28) scale(0.85)">
        <!-- Balloon Body -->
        <ellipse cx="12" cy="14" rx="11" ry="13" fill="#2563eb" />
        <!-- White Stripes -->
        <path d="M12 1C8 1 5 6 5 14C5 21 8 26 12 27C8 26 7 21 7 14C7 6 8 1 12 1Z" fill="#ffffff" opacity="0.9" />
        <path d="M12 1C16 1 19 6 19 14C19 21 16 26 12 27C16 26 17 21 17 14C17 6 16 1 12 1Z" fill="#ffffff" opacity="0.9" />
        <!-- Middle stripe -->
        <path d="M11 1.05C11 1.05 10.5 7 10.5 14C10.5 21 11 26.95 11 26.95H13C13 26.95 13.5 21 13.5 14C13.5 7 13 1.05 13 1.05H11Z" fill="#1d4ed8" />
        <!-- Skirt -->
        <path d="M9 26H15L14 29H10L9 26Z" fill="#1e40af" />
        <!-- Ropes -->
        <line x1="10" y1="29" x2="10.5" y2="32" stroke="#334155" stroke-width="0.7" />
        <line x1="14" y1="29" x2="13.5" y2="32" stroke="#334155" stroke-width="0.7" />
        <!-- Basket -->
        <rect x="10" y="32" width="4" height="3" rx="0.5" fill="#475569" />
      </g>
    </svg>
  `;

  return card;
}
