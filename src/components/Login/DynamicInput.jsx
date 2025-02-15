import React from "react";

const DynamicInput = ({ icon: Icon, placeholder, type, value, onChange }) => {
    return (
        <div className="py-2 text-gray-500 text-sm rounded-md relative flex items-center">
             {Icon && <Icon className="text-gray-500 mr-2 absolute pl-3 text-2xl     "/>} 
             
            <input      
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="pl-7 p-[10px] border-1 w-full border-gray-300 focus:border-gray-400 rounded-lg focus:outline-0"
            />
          
        </div>
    );
};

export default DynamicInput;
