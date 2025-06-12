import React from "react";
const Button = ({label, onClick, type}) => {
    return(
        <button 
            type={type} 
            className="w-full bg-blue-600 hover:bg-blue-500 transition rounded-lg py-2 text-white text-sm"
            onClick={onClick}
        >
            {label}
        </button>
    )
}


export default Button;