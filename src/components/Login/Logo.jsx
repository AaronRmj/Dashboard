import React from "react";
import BetterCallBusiness from "../../assets/images/BetterCallBusiness.png";


const Logo = () =>{
    return(
        <div className="flex my-5">
            <div>
                <img src={BetterCallBusiness} className="w-1/2" />
            </div>
        </div>
    )
}


export default Logo