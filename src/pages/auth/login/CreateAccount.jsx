import React from "react";
import { Link } from "react-router-dom";
const CreateAccount = () =>{
    return(
        <p className="text-sm text-gray-500 text-thin">Don't have an account? <Link to="/signup"  className="text-blue-600 text-sm">Create an account</Link></p>
    )
}


export default CreateAccount