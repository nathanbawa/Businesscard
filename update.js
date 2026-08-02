const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace Pannellum CSS with PSV CSS
content = content.replace(
    '<!-- Pannellum CSS -->\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>',
    '<!-- Photo Sphere Viewer CSS -->\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core/index.min.css" />'
).replace(
    '<!-- Pannellum CSS -->\r\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>',
    '<!-- Photo Sphere Viewer CSS -->\r\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core/index.min.css" />'
);

// 2. Add hero CSS
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

// 3. Replace VR DOM elements and wrap the rest in #main-content
const newDOM = `<!-- 360 HERO SECTION -->
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

<!-- IMAGE LIGHTBOX OVERLAY -->`;

// We want to replace everything from <!-- 360 VIEWER OVERLAY --> to <!-- IMAGE LIGHTBOX OVERLAY -->
content = content.replace(/<!-- 360 VIEWER OVERLAY -->[\s\S]*?<!-- IMAGE LIGHTBOX OVERLAY -->/, newDOM);

// 4. Close #main-content right before </body>
content = content.replace('</body>', '</div>\n</body>');

// 5. Replace Pannellum JS with PSV JS
const newScripts = `<!-- Three.js -->
<script src="https://cdn.jsdelivr.net/npm/three/build/three.min.js"></script>
<!-- Photo Sphere Viewer -->
<script src="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core/index.min.js"></script>
<!-- Device Orientation Plugin -->
<script src="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/device-orientation-plugin/index.min.js"></script>

<script>
    // Initialize Photo Sphere Viewer
    const viewer = new PhotoSphereViewer.Viewer({
        container: document.querySelector('#hero-360'),
        panorama: 'images/fb30.png',
        mousewheel: false, // Allows natural scrolling on the page
        touchmoveTwoFingers: false,
        navbar: false,
        defaultYaw: 0,
        defaultPitch: 0,
        plugins: [
            [PhotoSphereViewer.DeviceOrientationPlugin, {}]
        ]
    });

    // Fade out overlay after 3 seconds
    setTimeout(() => {
        document.getElementById('hero-360-overlay').classList.add('fade-out');
    }, 3000);

    // Lightbox functionality
    function openLightbox(src) {
        document.getElementById('lightbox-img').src = src;
        document.getElementById('image-lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        document.getElementById('image-lightbox').classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { document.getElementById('lightbox-img').src = ""; }, 400);
    }
    
    // Copy email functionality
    function copyEmail(e) {
        if(e) e.preventDefault();
        navigator.clipboard.writeText("urbanstage3d@gmail.com").then(function() {
            alert("Email copied to clipboard: urbanstage3d@gmail.com");
        }).catch(function(err) {
            console.error("Could not copy email", err);
        });
    }
</script>`;

content = content.replace(/<!-- Pannellum JS -->[\s\S]*?<\/html>/, newScripts + '\n\n</html>');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated index.html successfully!");
