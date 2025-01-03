import { useState } from "react";
import styled from "styled-components";
import IconGenerator from "./components/IconGenerator";

const AppContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: #f5f5f7;
`;

const Title = styled.h1`
    color: #1d1d1f;
    margin-bottom: 2rem;
    font-size: 2rem;
    text-align: center;
`;

function App() {
    return (
        <AppContainer>
            <Title>macOS Icon Generator</Title>
            <IconGenerator />
        </AppContainer>
    );
}

export default App;
