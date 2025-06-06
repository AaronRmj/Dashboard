import React from "react";

const RememberMe = ({ checked, onChange }) => {
    return (
        <div className="flex items-center">
            <input 
                type="checkbox" 
                className="mr-1"
                checked={checked}
                onChange={onChange}
            />
            <label className="text-md">Remember me</label>
        </div>
    );
};

export default RememberMe;
