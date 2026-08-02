const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Change CSS for #vr-overlay to be a normal section
// Replace with relative positioning + modal class
content = content.replace(
    '#vr-overlay {\r\n    position: fixed;\r\n    top: 0;\r\n    left: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    width: 100%;\r\n    height: 100%;\r\n    background: #000;\r\n    z-index: 9999;\r\n    opacity: 0;\r\n    visibility: hidden;\r\n    transition: 0.5s ease;\r\n}',
    `#vr-overlay {
    position: relative;
    width: 100%;
    height: 100vh;
    background: #000;
    z-index: 1;
    opacity: 1;
    visibility: visible;
}

#vr-overlay.vr-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
}`
);

// unix newlines
content = content.replace(
    '#vr-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    width: 100%;\n    height: 100%;\n    background: #000;\n    z-index: 9999;\n    opacity: 0;\n    visibility: hidden;\n    transition: 0.5s ease;\n}',
    `#vr-overlay {
    position: relative;
    width: 100%;
    height: 100vh;
    background: #000;
    z-index: 1;
    opacity: 1;
    visibility: visible;
}

#vr-overlay.vr-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
}`
);

content = content.replace(
    '#vr-overlay.vr-active {\r\n    opacity: 1;\r\n    visibility: visible;\r\n}',
    `#vr-overlay.vr-active {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
}`
);
content = content.replace(
    '#vr-overlay.vr-active {\n    opacity: 1;\n    visibility: visible;\n}',
    `#vr-overlay.vr-active {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
}`
);

// 2. Add an indicator/instruction for the hero
const scrollCue = `
    <div id="hero-scroll-cue" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); color: white; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; z-index: 5; animation: pulseClick 2s infinite ease-in-out; pointer-events: none;">
        ↓ Scroll to discover more
    </div>
`;
content = content.replace('<div id="panorama"></div>', '<div id="panorama"></div>' + scrollCue);


// 3. Modify the JS to load fb30.png automatically as hero
const newJS = `
    // List of the specific 360 local images
    const images360 = [
        "images/360photoconverterhoteroom.jpg",
        "images/housev3converter.jpg",
        "images/360photoconverterlivingroom.jpg",
        "images/360kitchen.png",
        "images/3.png"
    ];
    let currentIndex = -1; // -1 means hero mode (fb30.png)
    let viewer = null;
    let hasInteractedWithVR = false;

    // Load hero on startup
    window.addEventListener('DOMContentLoaded', () => {
        document.querySelector('.vr-close').style.display = 'none';
        document.querySelector('.vr-prev').style.display = 'none';
        document.querySelector('.vr-next').style.display = 'none';
        loadPanorama();
    });

    function openVR(index = 0) {
        currentIndex = index;
        document.getElementById('vr-overlay').classList.add('vr-active');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
        
        document.querySelector('.vr-close').style.display = 'block';
        document.querySelector('.vr-prev').style.display = 'block';
        document.querySelector('.vr-next').style.display = 'block';
        document.getElementById('hero-scroll-cue').style.display = 'none';
        
        loadPanorama();
    }

    function closeVR() {
        document.getElementById('vr-overlay').classList.remove('vr-active');
        document.body.style.overflow = ''; // restore scrolling
        
        // Revert to hero
        currentIndex = -1;
        document.querySelector('.vr-close').style.display = 'none';
        document.querySelector('.vr-prev').style.display = 'none';
        document.querySelector('.vr-next').style.display = 'none';
        document.getElementById('hero-scroll-cue').style.display = 'block';
        
        loadPanorama();
    }

    function loadPanorama() {
        if (viewer) {
            viewer.destroy();
        }
        
        // Show loading indicator
        document.getElementById('vr-loading').classList.remove('vr-loading-hidden');
        
        const imgSrc = currentIndex === -1 ? "images/fb30.png" : images360[currentIndex];
        
        viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": imgSrc,
            "autoLoad": true,
            "showControls": false,
            "hfov": 85,
            "minHfov": 50,
            "maxHfov": 100,
            "pitch": 0,
            "yaw": 0,
            "autoRotate": hasInteractedWithVR ? 0 : -1.5,
            "autoRotateInactivityDelay": 0,
            "mouseZoom": false // allows scrolling past the viewer
        });
        
        // Hide loading indicator when image finishes loading
        viewer.on('load', function() {
            document.getElementById('vr-loading').classList.add('vr-loading-hidden');

            if (!hasInteractedWithVR) {
                const prompt = document.getElementById('vr-interaction-prompt');
                prompt.classList.add('show-prompt');

                const vrContainer = document.getElementById('vr-overlay');
                
                const handleInteraction = (e) => {
                    if (e && e.target && e.target.classList && e.target.classList.contains('vr-close')) return;
                    
                    hasInteractedWithVR = true;
                    prompt.classList.remove('show-prompt');
                    
                    if (viewer) {
                        if (typeof viewer.stopAutoRotate === 'function') {
                            viewer.stopAutoRotate();
                        } else if (typeof viewer.setPitch === 'function') {
                            viewer.setPitch(viewer.getPitch());
                            viewer.setYaw(viewer.getYaw());
                        }
                    }
                };

                vrContainer.addEventListener('pointerdown', handleInteraction, { capture: true });
                vrContainer.addEventListener('mousedown', handleInteraction, { capture: true });
                vrContainer.addEventListener('touchstart', handleInteraction, { capture: true, passive: true });
                vrContainer.addEventListener('wheel', handleInteraction, { capture: true, passive: true });
            }
        });
    }

    function nextVR() {
        if (currentIndex === -1) return;
        currentIndex = (currentIndex + 1) % images360.length;
        loadPanorama();
    }

    function prevVR() {
        if (currentIndex === -1) return;
        currentIndex = (currentIndex - 1 + images360.length) % images360.length;
        loadPanorama();
    }
`;

// Replace the entire JS block
content = content.replace(/\/\/ List of the specific 360 local images[\s\S]*?function prevVR\(\) \{[\s\S]*?\}/, newJS);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated index.html to reuse the existing viewer component.");
