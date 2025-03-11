import React from "react";
import DynamicInput from "./DynamicInput";

//tout ce que Label recoit comme props, cette props est passé a son child DynamicInput
const Label = ({
    text, 
    value, 
    placeholder, 
    onChange,  
    name,
    ...props}) =>{
    return(
        <div>
            <label>{text}</label>
            <DynamicInput 
            placeholder={placeholder}
            value={value}
            name={name}
            onChange={onChange}
            {...props} />
        </div>
    )
}

export default Label