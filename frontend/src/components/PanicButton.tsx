import React from "react";

export const PanicButton = () => {   
    
    // Big red button. opens a modal that asks if you're sure you want to panic
    return (
            <button
                onClick={() => {
                    // open modal
                    
                }}
                style={{
                    backgroundColor: "red", color: "white", borderRadius: "50%", width: "50vw", aspectRatio: 1/1, fontSize: "3em",
                    borderColor: "black", borderWidth: "4px", borderStyle: "solid"
                }}
            > PANIC </button>
    );
};
