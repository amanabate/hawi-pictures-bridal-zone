const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Beautiful Hawi logo SVG
// Golden crest with camera lens aperture & bridal sparkle star
function createHawiSvg(size, isMaskable = false) {
  // For maskable, safe zone is central 80% (padding 10%)
  const scale = isMaskable ? 0.76 : 0.92;
  const center = size / 2;
  const radius = (size / 2) * scale;

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141008" />
        <stop offset="50%" stop-color="#0B0803" />
        <stop offset="100%" stop-color="#050301" />
      </linearGradient>

      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047" />
        <stop offset="30%" stop-color="#FCD535" />
        <stop offset="70%" stop-color="#EAB308" />
        <stop offset="100%" stop-color="#C9A24D" />
      </linearGradient>

      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF2B2" />
        <stop offset="50%" stop-color="#EAB308" />
        <stop offset="100%" stop-color="#936F22" />
      </linearGradient>

      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="${size * 0.02}" result="glow" />
        <feComposite in="SourceGraphic" in2="glow" operator="over" />
      </filter>
    </defs>

    <!-- Full bleed background for maskable compliance -->
    <rect width="${size}" height="${size}" fill="url(#bgGrad)" />

    <!-- Outer Gold Luxury Ring -->
    <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="url(#ringGrad)" stroke-width="${size * 0.025}" filter="url(#goldGlow)" />
    <circle cx="${center}" cy="${center}" r="${radius * 0.94}" fill="none" stroke="url(#goldGrad)" stroke-width="${size * 0.008}" stroke-dasharray="${size * 0.02} ${size * 0.015}" opacity="0.75" />

    <!-- Inner Crest Fill -->
    <circle cx="${center}" cy="${center}" r="${radius * 0.88}" fill="#141008" stroke="url(#ringGrad)" stroke-width="${size * 0.01}" />

    <!-- Stylized Camera Aperture / Crown Rays -->
    <g transform="translate(${center}, ${center})">
      <!-- 8 Aperture Blades / Rays -->
      ${[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => `
        <line x1="0" y1="${-radius * 0.48}" x2="0" y2="${-radius * 0.8}" stroke="url(#goldGrad)" stroke-width="${size * 0.012}" stroke-linecap="round" transform="rotate(${angle})" opacity="0.65" />
      `).join('')}

      <!-- Center Ornate Monogram Letter 'H' -->
      <path d="
        M ${-size * 0.13} ${-size * 0.16} 
        L ${-size * 0.07} ${-size * 0.16} 
        L ${-size * 0.07} ${-size * 0.03} 
        L ${size * 0.07} ${-size * 0.03} 
        L ${size * 0.07} ${-size * 0.16} 
        L ${size * 0.13} ${-size * 0.16} 
        L ${size * 0.13} ${size * 0.16} 
        L ${size * 0.07} ${size * 0.16} 
        L ${size * 0.07} ${size * 0.03} 
        L ${-size * 0.07} ${size * 0.03} 
        L ${-size * 0.07} ${size * 0.16} 
        L ${-size * 0.13} ${size * 0.16} Z
      " fill="url(#goldGrad)" filter="url(#goldGlow)" />

      <!-- Center Bridal Diamond Sparkle (Top) -->
      <path d="
        M 0 ${-size * 0.22}
        Q 0 ${-size * 0.18} ${size * 0.04} ${-size * 0.18}
        Q 0 ${-size * 0.18} 0 ${-size * 0.14}
        Q 0 ${-size * 0.18} ${-size * 0.04} ${-size * 0.18}
        Q 0 ${-size * 0.18} 0 ${-size * 0.22} Z
      " fill="#FFFBEB" />

      <!-- Sparkle at Bottom -->
      <path d="
        M 0 ${size * 0.22}
        Q 0 ${size * 0.18} ${size * 0.03} ${size * 0.18}
        Q 0 ${size * 0.18} 0 ${size * 0.14}
        Q 0 ${size * 0.18} ${-size * 0.03} ${size * 0.18}
        Q 0 ${size * 0.18} 0 ${size * 0.22} Z
      " fill="url(#goldGrad)" />
    </g>
  </svg>
  `;
}

// Admin Specific Icon (Hawi Crest with Shield / Badge)
function createAdminSvg(size) {
  const center = size / 2;
  const radius = (size / 2) * 0.9;

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="adminBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1A140A" />
        <stop offset="100%" stop-color="#0B0803" />
      </linearGradient>
      <linearGradient id="adminGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCD535" />
        <stop offset="100%" stop-color="#C9A24D" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#adminBg)" rx="${size * 0.2}" />
    <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="url(#adminGold)" stroke-width="${size * 0.03}" />

    <!-- Shield shape -->
    <path d="
      M ${center} ${size * 0.24}
      L ${size * 0.72} ${size * 0.35}
      C ${size * 0.72} ${size * 0.65} ${center} ${size * 0.78} ${center} ${size * 0.8}
      C ${center} ${size * 0.78} ${size * 0.28} ${size * 0.65} ${size * 0.28} ${size * 0.35} Z
    " fill="none" stroke="url(#adminGold)" stroke-width="${size * 0.03}" stroke-linejoin="round" />

    <!-- Center 'H' in shield -->
    <text x="${center}" y="${center * 1.15}" font-family="Georgia, serif" font-size="${size * 0.32}" font-weight="bold" fill="url(#adminGold)" text-anchor="middle">H</text>
  </svg>
  `;
}

function createShortcutSvg(size, iconType) {
  const center = size / 2;
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E170A" />
        <stop offset="100%" stop-color="#0B0803" />
      </linearGradient>
      <linearGradient id="scGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCD535" />
        <stop offset="100%" stop-color="#C9A24D" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#scBg)" rx="${size * 0.22}" />
    <rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.9}" height="${size * 0.9}" fill="none" stroke="url(#scGold)" stroke-width="${size * 0.02}" rx="${size * 0.18}" />
    ${
      iconType === 'calendar'
        ? `
        <!-- Calendar Icon -->
        <rect x="${size * 0.28}" y="${size * 0.3}" width="${size * 0.44}" height="${size * 0.42}" rx="${size * 0.06}" fill="none" stroke="url(#scGold)" stroke-width="${size * 0.04}" />
        <line x1="${size * 0.28}" y1="${size * 0.44}" x2="${size * 0.72}" y2="${size * 0.44}" stroke="url(#scGold)" stroke-width="${size * 0.03}" />
        <line x1="${size * 0.4}" y1="${size * 0.22}" x2="${size * 0.4}" y2="${size * 0.32}" stroke="url(#scGold)" stroke-width="${size * 0.04}" stroke-linecap="round" />
        <line x1="${size * 0.6}" y1="${size * 0.22}" x2="${size * 0.6}" y2="${size * 0.32}" stroke="url(#scGold)" stroke-width="${size * 0.04}" stroke-linecap="round" />
        <circle cx="${size * 0.42}" cy="${size * 0.54}" r="${size * 0.03}" fill="url(#scGold)" />
        <circle cx="${size * 0.58}" cy="${size * 0.54}" r="${size * 0.03}" fill="url(#scGold)" />
        <circle cx="${size * 0.5}" cy="${size * 0.62}" r="${size * 0.03}" fill="url(#scGold)" />
        `
        : iconType === 'sparkles'
        ? `
        <!-- Packages / Crown Sparkle Icon -->
        <path d="
          M ${center} ${size * 0.24}
          Q ${center} ${size * 0.38} ${size * 0.68} ${size * 0.38}
          Q ${center} ${size * 0.38} ${center} ${size * 0.52}
          Q ${center} ${size * 0.38} ${size * 0.32} ${size * 0.38}
          Q ${center} ${size * 0.38} ${center} ${size * 0.24} Z
        " fill="url(#scGold)" />
        <circle cx="${size * 0.34}" cy="${size * 0.64}" r="${size * 0.06}" fill="url(#scGold)" />
        <circle cx="${size * 0.66}" cy="${size * 0.64}" r="${size * 0.06}" fill="url(#scGold)" />
        <path d="M ${size * 0.32} ${size * 0.76} L ${size * 0.68} ${size * 0.76}" stroke="url(#scGold)" stroke-width="${size * 0.04}" stroke-linecap="round" />
        `
        : `
        <!-- Shield / Admin Icon -->
        <path d="
          M ${center} ${size * 0.26}
          L ${size * 0.72} ${size * 0.36}
          C ${size * 0.72} ${size * 0.62} ${center} ${size * 0.76} ${center} ${size * 0.78}
          C ${center} ${size * 0.76} ${size * 0.28} ${size * 0.62} ${size * 0.28} ${size * 0.36} Z
        " fill="none" stroke="url(#scGold)" stroke-width="${size * 0.04}" stroke-linejoin="round" />
        <circle cx="${center}" cy="${size * 0.5}" r="${size * 0.08}" fill="url(#scGold)" />
        `
    }
  </svg>
  `;
}

// Generate PWA rich screenshots
function createScreenshotSvg(width, height, type) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141008" />
        <stop offset="50%" stop-color="#0B0803" />
        <stop offset="100%" stop-color="#19130A" />
      </linearGradient>
      <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047" />
        <stop offset="50%" stop-color="#EAB308" />
        <stop offset="100%" stop-color="#CA8A04" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#scBg)" />
    
    <!-- Top Bar -->
    <rect x="0" y="0" width="${width}" height="${height * 0.08}" fill="#0A0804" opacity="0.9" />
    <circle cx="${width * 0.08}" cy="${height * 0.04}" r="${Math.min(width, height) * 0.02}" fill="url(#goldText)" />
    <text x="${width * 0.12}" y="${height * 0.048}" font-family="Georgia, serif" font-size="${Math.min(width, height) * 0.024}" font-weight="bold" fill="#F8FAFC">HAWI</text>
    <text x="${width * 0.12 + Math.min(width, height) * 0.06}" y="${height * 0.048}" font-family="system-ui, sans-serif" font-size="${Math.min(width, height) * 0.016}" fill="url(#goldText)">Pictures &amp; Bridal Zone</text>
    
    <!-- Hero / Showcase Body -->
    ${
      type === 'wide'
        ? `
      <rect x="${width * 0.08}" y="${height * 0.15}" width="${width * 0.84}" height="${height * 0.72}" rx="32" fill="#1C160C" stroke="#3D2D15" stroke-width="2" />
      <text x="${width * 0.5}" y="${height * 0.32}" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="url(#goldText)" text-anchor="middle">Bakka Miidhaginaafi Yaadannoon Itti argamu</text>
      <text x="${width * 0.5}" y="${height * 0.40}" font-family="system-ui, sans-serif" font-size="24" fill="#E2E8F0" text-anchor="middle">Ethiopia's Premier Luxury Wedding Photography &amp; Bridal Salon</text>
      
      <!-- 4 Service Highlights -->
      <g transform="translate(${width * 0.15}, ${height * 0.50})">
        <rect x="0" y="0" width="${width * 0.15}" height="${height * 0.25}" rx="16" fill="#2A1F10" stroke="#EAB308" stroke-width="1" />
        <text x="${width * 0.075}" y="${height * 0.14}" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#FFFBEB" text-anchor="middle">Photography 4K</text>
        
        <rect x="${width * 0.18}" y="0" width="${width * 0.15}" height="${height * 0.25}" rx="16" fill="#2A1F10" stroke="#EAB308" stroke-width="1" />
        <text x="${width * 0.255}" y="${height * 0.14}" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#FFFBEB" text-anchor="middle">Bridal Salon</text>
        
        <rect x="${width * 0.36}" y="0" width="${width * 0.15}" height="${height * 0.25}" rx="16" fill="#2A1F10" stroke="#EAB308" stroke-width="1" />
        <text x="${width * 0.435}" y="${height * 0.14}" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#FFFBEB" text-anchor="middle">Beauty &amp; Hair</text>
        
        <rect x="${width * 0.54}" y="0" width="${width * 0.15}" height="${height * 0.25}" rx="16" fill="#2A1F10" stroke="#EAB308" stroke-width="1" />
        <text x="${width * 0.615}" y="${height * 0.14}" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#FFFBEB" text-anchor="middle">Aadaa Oromoo</text>
      </g>
      `
        : type === 'mobile'
        ? `
      <g transform="translate(${width * 0.08}, ${height * 0.14})">
        <rect x="0" y="0" width="${width * 0.84}" height="${height * 0.38}" rx="24" fill="#1C160C" stroke="#D4AF37" stroke-width="2" />
        <circle cx="${width * 0.42}" cy="${height * 0.12}" r="${width * 0.12}" fill="#2E210E" stroke="url(#goldText)" stroke-width="3" />
        <text x="${width * 0.42}" y="${height * 0.22}" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="url(#goldText)" text-anchor="middle">Hawi Bridal</text>
        <text x="${width * 0.42}" y="${height * 0.27}" font-family="system-ui, sans-serif" font-size="20" fill="#E2E8F0" text-anchor="middle">Direct Calendar Reservation</text>
        <rect x="${width * 0.18}" y="${height * 0.30}" width="${width * 0.48}" height="${height * 0.05}" rx="16" fill="url(#goldText)" />
        <text x="${width * 0.42}" y="${height * 0.334}" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#0B0803" text-anchor="middle">RESERVE DATE</text>
      </g>
      
      <g transform="translate(${width * 0.08}, ${height * 0.56})">
        <rect x="0" y="0" width="${width * 0.84}" height="${height * 0.36}" rx="24" fill="#18130B" stroke="#3D2D15" stroke-width="1.5" />
        <text x="${width * 0.42}" y="${height * 0.08}" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="url(#goldText)" text-anchor="middle">Special Package — 60,000 ETB</text>
        <text x="${width * 0.42}" y="${height * 0.14}" font-family="system-ui, sans-serif" font-size="18" fill="#94A3B8" text-anchor="middle">40x60 Album, 30x60 Album, Studio &amp; Video 4K</text>
      </g>
      `
        : `
      <!-- Packages Screen -->
      <g transform="translate(${width * 0.08}, ${height * 0.14})">
        <text x="${width * 0.42}" y="${height * 0.06}" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="url(#goldText)" text-anchor="middle">Wedding Packages</text>
        <text x="${width * 0.42}" y="${height * 0.10}" font-family="system-ui, sans-serif" font-size="18" fill="#CBD5E1" text-anchor="middle">Special Package &amp; Packages 1 to 8</text>
        
        <rect x="0" y="${height * 0.14}" width="${width * 0.84}" height="${height * 0.22}" rx="20" fill="#241B0E" stroke="#D4AF37" stroke-width="2" />
        <text x="${width * 0.08}" y="${height * 0.22}" font-family="Georgia, serif" font-size="26" font-weight="bold" fill="#FFFBEB">Package 1 (Popular)</text>
        <text x="${width * 0.08}" y="${height * 0.27}" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="url(#goldText)">70,000 ETB</text>
        
        <rect x="0" y="${height * 0.39}" width="${width * 0.84}" height="${height * 0.22}" rx="20" fill="#1C160C" stroke="#3D2D15" stroke-width="1.5" />
        <text x="${width * 0.08}" y="${height * 0.47}" font-family="Georgia, serif" font-size="26" font-weight="bold" fill="#FFFBEB">Package 2</text>
        <text x="${width * 0.08}" y="${height * 0.52}" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="url(#goldText)">80,000 ETB</text>
      </g>
      `
    }
  </svg>
  `;
}

// iOS Splash Screen (Portrait 1170x2532)
function createIOSSplashSvg(width, height) {
  const center = width / 2;
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="splashBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141008" />
        <stop offset="40%" stop-color="#0B0803" />
        <stop offset="100%" stop-color="#050301" />
      </linearGradient>
      <linearGradient id="splashGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047" />
        <stop offset="50%" stop-color="#EAB308" />
        <stop offset="100%" stop-color="#CA8A04" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#splashBg)" />
    
    <!-- Central Luxury Logo -->
    <g transform="translate(${center}, ${height * 0.45})">
      <circle cx="0" cy="0" r="160" fill="none" stroke="url(#splashGold)" stroke-width="6" />
      <circle cx="0" cy="0" r="148" fill="#141008" stroke="url(#splashGold)" stroke-width="2" stroke-dasharray="12 8" />
      <text x="0" y="30" font-family="Georgia, serif" font-size="110" font-weight="bold" fill="url(#splashGold)" text-anchor="middle">H</text>
      <path d="M 0 -70 L 15 -45 L -15 -45 Z" fill="#FFFBEB" />
    </g>
    
    <!-- Brand Typography -->
    <text x="${center}" y="${height * 0.56}" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="url(#splashGold)" text-anchor="middle" letter-spacing="4">HAWI</text>
    <text x="${center}" y="${height * 0.59}" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#F8FAFC" text-anchor="middle" letter-spacing="2">PICTURES &amp; BRIDAL ZONE</text>
    <text x="${center}" y="${height * 0.63}" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#E2E8F0" opacity="0.8" text-anchor="middle">Bakka Miidhaginaafi Yaadannoon Itti argamu</text>
    
    <text x="${center}" y="${height * 0.94}" font-family="system-ui, sans-serif" font-size="16" fill="#CA8A04" text-anchor="middle">Addis Ababa, Ethiopia · 0988 01 80 16</text>
  </svg>
  `;
}

// Offline image placeholder SVG
function createOfflinePlaceholderSvg() {
  return `
  <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#18130B" />
    <rect x="8" y="8" width="384" height="284" rx="16" fill="none" stroke="#3D2D15" stroke-width="2" />
    <!-- Camera outline -->
    <g transform="translate(200, 120)">
      <rect x="-40" y="-25" width="80" height="55" rx="8" fill="none" stroke="#D4AF37" stroke-width="3" />
      <path d="M -15 -25 L -8 -36 L 8 -36 L 15 -25 Z" fill="#D4AF37" />
      <circle cx="0" cy="2" r="16" fill="none" stroke="#D4AF37" stroke-width="3" />
      <circle cx="22" cy="-12" r="4" fill="#D4AF37" />
    </g>
    <text x="200" y="195" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#D4AF37" text-anchor="middle">Hawi Pictures</text>
    <text x="200" y="220" font-family="system-ui, sans-serif" font-size="12" fill="#94A3B8" text-anchor="middle">Image available when reconnected</text>
  </svg>
  `;
}

async function generateAllIcons() {
  const publicDir = path.join(process.cwd(), 'public');
  console.log('Generating PWA icons and rich assets in:', publicDir);

  // 1. icon.svg
  const svgContent = createHawiSvg(512, false);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

  // 2. icon-192.png
  await sharp(Buffer.from(createHawiSvg(192, false))).png().toFile(path.join(publicDir, 'icon-192.png'));

  // 3. icon-512.png
  await sharp(Buffer.from(createHawiSvg(512, false))).png().toFile(path.join(publicDir, 'icon-512.png'));

  // 4. icon-maskable-512.png (padded safe zone for Android circular/squircle mask)
  await sharp(Buffer.from(createHawiSvg(512, true))).png().toFile(path.join(publicDir, 'icon-maskable-512.png'));

  // 5. apple-touch-icon.png (180x180)
  await sharp(Buffer.from(createHawiSvg(180, false))).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 6. admin-icon-192.png (192x192)
  await sharp(Buffer.from(createAdminSvg(192))).png().toFile(path.join(publicDir, 'admin-icon-192.png'));

  // 7. Shortcut icons (192x192)
  await sharp(Buffer.from(createShortcutSvg(192, 'calendar'))).png().toFile(path.join(publicDir, 'shortcut-booking.png'));
  await sharp(Buffer.from(createShortcutSvg(192, 'sparkles'))).png().toFile(path.join(publicDir, 'shortcut-packages.png'));
  await sharp(Buffer.from(createShortcutSvg(192, 'shield'))).png().toFile(path.join(publicDir, 'shortcut-admin.png'));

  // 8. PWA Screenshots (Mobile 1080x1920, Wide 1920x1080, Packages 1080x1920)
  await sharp(Buffer.from(createScreenshotSvg(1080, 1920, 'mobile'))).png().toFile(path.join(publicDir, 'screenshot-mobile.png'));
  await sharp(Buffer.from(createScreenshotSvg(1920, 1080, 'wide'))).png().toFile(path.join(publicDir, 'screenshot-wide.png'));
  await sharp(Buffer.from(createScreenshotSvg(1080, 1920, 'packages'))).png().toFile(path.join(publicDir, 'screenshot-packages.png'));

  // 9. iOS Splash image (1170x2532)
  await sharp(Buffer.from(createIOSSplashSvg(1170, 2532))).png().toFile(path.join(publicDir, 'apple-splash-portrait.png'));

  // 10. Offline Image Placeholder
  const offlineSvg = createOfflinePlaceholderSvg();
  fs.writeFileSync(path.join(publicDir, 'placeholder-offline.svg'), offlineSvg);
  await sharp(Buffer.from(offlineSvg)).png().toFile(path.join(publicDir, 'placeholder-offline.png'));

  console.log('Successfully generated all PWA icons, shortcuts, screenshots, splash and placeholder assets!');
}

generateAllIcons().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
