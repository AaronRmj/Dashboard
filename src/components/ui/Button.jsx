import React from "react";
const Button = ({label}) => {
    return(
        <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-2 text-white text-sm"
        >
            {label}
        </button>
    )
}


export default Button;