const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add hero CSS right after GLOBAL
const heroCSS = `
/* ========================= */
/* 360 HERO */
/* ========================= */

.hero-wrapper {
    position: relative;
    width: 100%;
    height: 100vh;
    z-index: 1;
}

#hero-360 {
    width: 100%;
    height: 100%;
    background: #111;
}

.hero-360-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white;
    z-index: 5;
    pointer-events: none;
    transition: opacity 1s ease;
}

.hero-360-overlay.fade-out {
    opacity: 0;
}

.concept-tag {
    font-size: 12px;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 10px;
    font-weight: 500;
}

.instruction {
    font-size: 24px;
    font-weight: 300;
}

.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
    .desktop-only { display: none; }
    .mobile-only { display: block; }
}

.scroll-cue {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    z-index: 5;
    animation: bounce 2s infinite;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translate(-50%, 0); }
    40% { transform: translate(-50%, -10px); }
    60% { transform: translate(-50%, -5px); }
}

#main-content {
    position: relative;
    z-index: 10;
    background: #F9F7F2;
    box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
}

`;

content = content.replace('/* GLOBAL */', heroCSS + '/* GLOBAL */');

// 2. Add hero HTML right after body
const heroHTML = `<!-- 360 HERO SECTION -->
<div class="hero-wrapper">
    <div id="hero-360"></div>
    <div class="hero-360-overlay" id="hero-360-overlay">
        <div class="concept-tag">Interactive 360° Concept</div>
        <div class="instruction desktop-only">Drag to explore</div>
        <div class="instruction mobile-only">Swipe or move your phone</div>
    </div>
    <div class="scroll-cue">
        ↓ Scroll to discover more
    </div>
</div>

<div id="main-content">
`;

// Insert the hero layout right after <body>
content = content.replace('<body>', '<body>\n\n' + heroHTML);

// Ensure the #main-content is closed at the very end
content = content.replace('</body>', '</div>\n</body>');

// 3. Add Pannellum JS for the hero
const heroJS = `
    // Initialize Hero Pannellum
    let hasInteractedWithHero = false;
    const heroViewer = pannellum.viewer('hero-360', {
        "type": "equirectangular",
        "panorama": "images/fb30.png",
        "autoLoad": true,
        "showControls": false,
        "hfov": 85,
        "minHfov": 50,
        "maxHfov": 100,
        "pitch": 0,
        "yaw": 0,
        "autoRotate": -1.5,
        "autoRotateInactivityDelay": 0,
        "mouseZoom": false,
        "orientationOnByDefault": true
    });

    // Fade out overlay after 3 seconds
    setTimeout(() => {
        document.getElementById('hero-360-overlay').classList.add('fade-out');
    }, 3000);
    
    heroViewer.on('load', function() {
        // Handle interaction stopping auto rotate
        const heroContainer = document.getElementById('hero-360');
        const handleHeroInteraction = () => {
            if (hasInteractedWithHero) return;
            hasInteractedWithHero = true;
            document.getElementById('hero-360-overlay').classList.add('fade-out');
            if (typeof heroViewer.stopAutoRotate === 'function') {
                heroViewer.stopAutoRotate();
            } else if (typeof heroViewer.setPitch === 'function') {
                heroViewer.setPitch(heroViewer.getPitch());
                heroViewer.setYaw(heroViewer.getYaw());
            }
        };
        heroContainer.addEventListener('pointerdown', handleHeroInteraction, { capture: true });
        heroContainer.addEventListener('mousedown', handleHeroInteraction, { capture: true });
        heroContainer.addEventListener('touchstart', handleHeroInteraction, { capture: true, passive: true });
    });
`;

content = content.replace('</script>', heroJS + '\n</script>');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Reapplied hero layout using Pannellum successfully!");
