import React from "react";
import { LeftCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export interface BackButtonProps {
    path?: string;
}




export const BackButton = (props: BackButtonProps) => {   
        
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(props.path ?? "/");
    };

    // Big red button. opens a modal that asks if you're sure you want to panic
    return (
        <LeftCircleOutlined
                onClick={handleBackClick}
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    zIndex: 1000,
                    padding: '10px 15px',
                    backgroundColor: '#007BFF',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            />
    );
};
