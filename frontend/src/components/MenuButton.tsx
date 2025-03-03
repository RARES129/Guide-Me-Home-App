import React from "react";

export interface MenuButtonProps {
    onClick: () => void;
    text: string;
}




export const MenuButton = (props: MenuButtonProps) => {   
    
    // Big red button. opens a modal that asks if you're sure you want to panic
    return (
        <button
            onClick={() => {
                props.onClick();
            }}
            style={{
                display: "block",
                backgroundColor: "lightblue", // TODO: Change color
                color: "black",
                borderRadius: "5px",
                width: "100%",
                margin: "10px",
                padding: "5px",
                fontSize: "2em",
            }}
        > {props.text} </button>
    );
};
