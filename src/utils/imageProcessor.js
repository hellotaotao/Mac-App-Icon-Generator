import JSZip from "jszip";
import { saveAs } from "file-saver";

const ICON_SIZES = [16, 32, 128, 256, 512];

export async function processImage(imageData, cornerRadius = 8) {
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

    // Helper function to draw rounded rectangle
    function drawRoundedRect(ctx, size, cornerRadius) {
        const radius = size / cornerRadius;
        ctx.beginPath();
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
    }

    // Process each size
    for (const size of ICON_SIZES) {
        // Generate @1x version
        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);
        drawRoundedRect(ctx, size, cornerRadius);
        ctx.drawImage(image, 0, 0, size, size);
        const iconData1x = canvas.toDataURL("image/png");
        const base64Data1x = iconData1x.replace(/^data:image\/png;base64,/, "");
        zip.file(`${size}@1x.png`, base64Data1x, { base64: true });

        // Generate @2x version
        const size2x = size * 2;
        canvas.width = size2x;
        canvas.height = size2x;
        ctx.clearRect(0, 0, size2x, size2x);
        drawRoundedRect(ctx, size2x, cornerRadius);
        ctx.drawImage(image, 0, 0, size2x, size2x);
        const iconData2x = canvas.toDataURL("image/png");
        const base64Data2x = iconData2x.replace(/^data:image\/png;base64,/, "");
        zip.file(`${size}@2x.png`, base64Data2x, { base64: true });
    }

    // Generate and download zip
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "macos-icons.zip");
}
