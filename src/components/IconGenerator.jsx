import { useState, useCallback } from "react";
import styled from "styled-components";
import { processImage } from "../utils/imageProcessor";

const DropZone = styled.div`
    width: 400px;
    height: 300px;
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

const PreviewImage = styled.img`
    max-width: 200px;
    max-height: 200px;
    margin-top: 10px;
    border-radius: 12px;
`;

function IconGenerator() {
    const [image, setImage] = useState(null);
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

    const handleGenerate = async () => {
        if (!image || isProcessing) return;
        setIsProcessing(true);
        try {
            await processImage(image);
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
            <DropZone
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("fileInput").click()}
            >
                {image ? (
                    <PreviewImage src={image} alt="Preview" />
                ) : (
                    <p>Drag and drop or click to upload a 1024x1024 image</p>
                )}
            </DropZone>
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
