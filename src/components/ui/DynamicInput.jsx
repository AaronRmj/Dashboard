import React from "react";

const DynamicInput = ({ icon: Icon, placeholder,disabled, type, value, onChange, inputClassName }) => {
    return (
        <div className="py-2 text-gray-700 text-md rounded-md relative flex items-center">
            {/* si icon existe alors ... */}
            {Icon && <Icon className="text-gray-500 mr-2 absolute pl-3 text-2xl"/>} 
             
            <input      
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`pl-7 ${inputClassName} p-[10px] border-1 w-3/4 border-gray-300 focus:border-gray-400 rounded-lg focus:outline-0`}
                disabled={disabled}
            />
          
        </div>
    );
};

export default DynamicInput;
