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

const RadiusControl = styled.div`
    margin: 20px 0;
    display: flex;
    align-items: center;
    gap: 16px;
`;

const RadioGroup = styled.div`
    display: flex;
    gap: 12px;
`;

const RadioLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    color: #333;

    input {
        cursor: pointer;
    }
`;

const CropPreviewContainer = styled.div`
    position: relative;
    width: 800px;
    height: 600px;

    .ReactCrop {
        position: relative;
        max-width: 100%;
        max-height: 100%;
    }

    .ReactCrop__crop-selection {
        border: 1px solid #2563eb;
    }

    .ReactCrop__crop-area {
        position: relative;
    }

    .ReactCrop > img {
        opacity: 0.5;
    }

    .ReactCrop__crop-selection > img {
        opacity: 1;
    }

    .ReactCrop__drag-handle {
        width: 12px !important;
        height: 12px !important;
        background-color: #fff !important;
        border: 2px solid #2563eb !important;
        border-radius: 50% !important;
        opacity: 1 !important;
        position: absolute !important;
    }

    .ReactCrop__drag-handle::before {
        content: '';
        display: block;
        position: absolute;
        width: 20px;
        height: 20px;
        top: -6px;
        left: -6px;
    }

    .ReactCrop__drag-bar {
        background-color: #2563eb !important;
        opacity: 0.7 !important;
    }

    .ReactCrop__drag-bar.ord-n,
    .ReactCrop__drag-bar.ord-s {
        height: 2px !important;
    }

    .ReactCrop__drag-bar.ord-e,
    .ReactCrop__drag-bar.ord-w {
        width: 2px !important;
    }

    &.radius-8 .ReactCrop__crop-selection {
        border-radius: 12.5%;
    }

    &.radius-6 .ReactCrop__crop-selection {
        border-radius: 16.67%;
    }

    &.radius-4 .ReactCrop__crop-selection {
        border-radius: 25%;
    }
`;

function IconGenerator() {
    const [image, setImage] = useState(null);
    const [imageRef, setImageRef] = useState(null);
    const [crop, setCrop] = useState({
        unit: "%",
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        aspect: 1,
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [cornerRadius, setCornerRadius] = useState(8);

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

    const handleRadiusChange = (value) => {
        setCornerRadius(value);
    };

    const handleGenerate = async () => {
        if (!image || isProcessing) return;
        setIsProcessing(true);
        try {
            const croppedImage = getCroppedImage();
            await processImage(croppedImage || image, cornerRadius);
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
                    <CropPreviewContainer className={`radius-${cornerRadius}`}>
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            aspect={1}
                            circularCrop={false}
                            ruleOfThirds
                            minWidth={100}
                            minHeight={100}
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
                    <RadiusControl>
                        <span>Corner Radius:</span>
                        <RadioGroup>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    name="radius"
                                    checked={cornerRadius === 8}
                                    onChange={() => handleRadiusChange(8)}
                                />
                                1/8
                            </RadioLabel>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    name="radius"
                                    checked={cornerRadius === 6}
                                    onChange={() => handleRadiusChange(6)}
                                />
                                1/6
                            </RadioLabel>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    name="radius"
                                    checked={cornerRadius === 4}
                                    onChange={() => handleRadiusChange(4)}
                                />
                                1/4
                            </RadioLabel>
                        </RadioGroup>
                    </RadiusControl>
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
