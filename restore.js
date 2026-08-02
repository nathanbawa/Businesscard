const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Re-add the overlay DOM before <div class="container">
const overlayDOM = `
<!-- GALLERY 360 VIEWER OVERLAY -->
<div id="vr-overlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:#000; z-index:9999; opacity:0; visibility:hidden; transition:0.5s ease;">
    <div class="vr-close" onclick="closeVR()" style="position:absolute; top:30px; right:40px; color:white; font-size:40px; cursor:pointer; z-index:10002;">×</div>
    <div class="vr-nav vr-prev" onclick="prevVR()" style="position:absolute; top:50%; left:20px; color:white; font-size:50px; cursor:pointer; z-index:10000; transform:translateY(-50%);">&#10094;</div>
    <div class="vr-nav vr-next" onclick="nextVR()" style="position:absolute; top:50%; right:20px; color:white; font-size:50px; cursor:pointer; z-index:10000; transform:translateY(-50%);">&#10095;</div>
    <div id="gallery-panorama" style="width:100%; height:100%;"></div>
</div>
`;
content = content.replace('<div class="container">', overlayDOM + '\n<div class="container">');

// 2. Re-add the gallery JS functions
const galleryJS = `
    // Gallery 360 Viewer functionality
    const images360 = [
        "images/360photoconverterhoteroom.jpg",
        "images/housev3converter.jpg",
        "images/360photoconverterlivingroom.jpg",
        "images/360kitchen.png",
        "images/3.png"
    ];
    let currentVRIndex = 0;
    let galleryViewer = null;

    function openVR(index = 0) {
        currentVRIndex = index;
        const overlay = document.getElementById('vr-overlay');
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        
        if (galleryViewer) {
            galleryViewer.destroy();
        }
        
        galleryViewer = new PhotoSphereViewer.Viewer({
            container: document.querySelector('#gallery-panorama'),
            panorama: images360[currentVRIndex],
            navbar: false,
            defaultYaw: 0,
            defaultPitch: 0
        });
    }

    function closeVR() {
        const overlay = document.getElementById('vr-overlay');
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        document.body.style.overflow = '';
        if (galleryViewer) {
            setTimeout(() => {
                galleryViewer.destroy();
                galleryViewer = null;
            }, 500);
        }
    }

    function nextVR() {
        currentVRIndex = (currentVRIndex + 1) % images360.length;
        if (galleryViewer) galleryViewer.setPanorama(images360[currentVRIndex]);
    }

    function prevVR() {
        currentVRIndex = (currentVRIndex - 1 + images360.length) % images360.length;
        if (galleryViewer) galleryViewer.setPanorama(images360[currentVRIndex]);
    }
`;

content = content.replace('// Lightbox functionality', galleryJS + '\n    // Lightbox functionality');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Restored gallery viewer successfully!");
