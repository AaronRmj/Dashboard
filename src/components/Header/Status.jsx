import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { CgProfile } from "react-icons/cg";

const Status = () =>{
    return(
            <button className="flex items-center text-3xl">
                <CgProfile className="right-8 absolute" />
                <IoMdArrowDropdown className="right-1 absolute" />
            </button>
        
    )
}

export default Status;