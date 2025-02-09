import React from "react";
import BCB from "../../assets/images/BCB.png";


const Logo = () =>{
    return(
        <div className="flex my-5">
            <div>
                <img src={BCB} className="w-2/3" />
            </div>
        </div>
    )
}


export default Logo