import JSZip from "jszip";
import { saveAs } from "file-saver";

const ICON_SIZES = [16, 32, 128, 256, 512, 1024];

export async function processImage(imageData) {
    const zip = new JSZip();

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Load the image
    const image = new Image();
    image.src = imageData;

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
    });

    // Process each size
    for (const size of ICON_SIZES) {
        // Set canvas size
        canvas.width = size;
        canvas.height = size;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Draw rounded rectangle
        ctx.beginPath();
        const radius = size / 8; // Corner radius is 1/8 of the icon size
        ctx.moveTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.closePath();
        ctx.clip();

        // Draw and scale image
        ctx.drawImage(image, 0, 0, size, size);

        // Add to zip
        const iconData = canvas.toDataURL("image/png");
        const base64Data = iconData.replace(/^data:image\/png;base64,/, "");
        zip.file(`icon_${size}x${size}.png`, base64Data, { base64: true });
    }

    // Generate and download zip
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "macos-icons.zip");
}
