import { useState, useCallback } from "react";
import styled from "styled-components";
import ReactCrop from "react-image-crop";
import { processImage } from "../utils/imageProcessor";
import "react-image-crop/dist/ReactCrop.css";

const DropZone = styled.div`
    width: 800px;
    height: 600px;
    border: 2px dashed #007aff;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 20px;
    text-align: center;
    margin-bottom: 20px;

    &:hover {
        border-color: #0051e6;
        background-color: #f0f0f0;
    }
`;

const GenerateButton = styled.button`
    margin-top: 20px;
    padding: 12px 24px;
    background-color: #007aff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #0051e6;
    }

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

const ImageContainer = styled.div`
    max-width: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Instructions = styled.p`
    color: #666;
    margin-bottom: 10px;
    font-size: 0.9rem;
`;

const CropPreviewContainer = styled.div`
    position: relative;
    width: 800px;
    height: 600px;

    .ReactCrop__crop-selection {
        border-radius: 12.5%; // 1/8 of the selection size
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    }
`;

function IconGenerator() {
    const [image, setImage] = useState(null);
    const [imageRef, setImageRef] = useState(null);
    const [crop, setCrop] = useState({
        unit: "%",
        width: 100,
        aspect: 1,
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const getCroppedImage = () => {
        if (!imageRef || !crop) return null;

        const canvas = document.createElement("canvas");
        const scaleX = imageRef.naturalWidth / imageRef.width;
        const scaleY = imageRef.naturalHeight / imageRef.height;
        const pixelRatio = window.devicePixelRatio;

        canvas.width = Math.floor(crop.width * scaleX);
        canvas.height = Math.floor(crop.height * scaleY);

        const ctx = canvas.getContext("2d");
        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = "high";

        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;

        ctx.drawImage(
            imageRef,
            cropX,
            cropY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );

        return canvas.toDataURL("image/png");
    };

    const handleGenerate = async () => {
        if (!image || isProcessing) return;
        setIsProcessing(true);
        try {
            const croppedImage = getCroppedImage();
            await processImage(croppedImage || image);
        } catch (error) {
            console.error("Error generating icons:", error);
            alert("Failed to generate icons. Please try again.");
        }
        setIsProcessing(false);
    };

    return (
        <div>
            <input
                type="file"
                id="fileInput"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
            />
            {!image ? (
                <DropZone
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById("fileInput").click()}
                >
                    <p>Drag and drop or click to upload an image</p>
                    <Instructions>
                        The image will be cropped to a square and scaled to
                        1024x1024
                    </Instructions>
                </DropZone>
            ) : (
                <ImageContainer>
                    <CropPreviewContainer>
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            aspect={1}
                            circularCrop={false}
                        >
                            <img
                                src={image}
                                alt="Upload"
                                style={{
                                    maxWidth: "800px",
                                    maxHeight: "600px",
                                }}
                                onLoad={(e) => setImageRef(e.currentTarget)}
                            />
                        </ReactCrop>
                    </CropPreviewContainer>
                    <Instructions>
                        Drag to adjust the crop area. The selection will be used
                        to generate icons.
                    </Instructions>
                </ImageContainer>
            )}
            <GenerateButton
                onClick={handleGenerate}
                disabled={!image || isProcessing}
            >
                {isProcessing ? "Generating..." : "Generate Icons"}
            </GenerateButton>
        </div>
    );
}

export default IconGenerator;
