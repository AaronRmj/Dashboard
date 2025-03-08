import React from "react";
import DynamicInput from "./DynamicInput";

//tout ce que Label recoit comme props, cette props est passé a son child DynamicInput
const Label = ({text, ...props}) =>{
    return(
        <div>
            <label>{text}</label>
            <DynamicInput {...props} />
        </div>
    )
}

export default Label