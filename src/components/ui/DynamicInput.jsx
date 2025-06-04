import React from "react";

const DynamicInput = ({ icon: Icon, name, placeholder,disabled, type, value, onChange, inputClassName }) => {
    return (
        <div className="py-2 text-gray-700 text-lg rounded-md relative flex items-center">
            {/* si icon existe alors ... */}
            {Icon && <Icon className="text-gray-500 mr-5 absolute pl-3 text-3xl -ml-1 " />} 
             
            <input      
                type={type}
                placeholder={placeholder}
                value={value}
                name={name}
                onChange={onChange}
                className={`pl-7 ${inputClassName} p-[8px]  border-1 w-4/3 border-gray-300   focus:outline-none focus:ring-1 focus:ring-sky-300 rounded-lg focus:outline-0`}
                disabled={disabled}
            />
          
        </div>
    );
};


export default DynamicInput;
