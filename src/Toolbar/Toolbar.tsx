import styled from '@emotion/styled';
import 'Stats';
import 'RemoteMic/eventListeners';
import { IconButton, Tooltip } from '@mui/material';
import { Fullscreen, QrCode2 } from '@mui/icons-material';
import { useState } from 'react';
import QRCodeModal from 'Toolbar/QRCodeModal';

function Toolbar() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            {isModalOpen && <QRCodeModal closeModal={closeModal} />}
            <ToolbarContainer>
                <Tooltip title="Enter fullscreen">
                    <IconButton
                        size="small"
                        onClick={() => {
                            try {
                                document.body.requestFullscreen().catch(console.info);
                            } catch (e) {}
                        }}>
                        <Fullscreen fontSize="large" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Connect phone">
                    <IconButton size="small" onClick={() => setIsModalOpen((current) => !current)}>
                        <QrCode2 fontSize="large" />
                    </IconButton>
                </Tooltip>
            </ToolbarContainer>
        </>
    );
}

const ToolbarContainer = styled.div`
    cursor: pointer;
    background: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 0.2rem;
    padding-left: 1rem;
    margin: 0;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 10000;
    color: white;

    svg {
        fill: white;
    }

    display: flex;
    gap: 0.75rem;
    border-bottom-left-radius: 1.5rem;
`;

export default Toolbar;
