import React from "react";
import { Link } from "react-router-dom";
//menu prend 3 parametres label, href ,icon 

const Menu = ({ menuItems }) =>{
    return(
        <ul>
            {menuItems.map((item, index) =>(
                <li key={index} className="flex items-center space-x-2 p-2">
                    {item.icon}
                    <Link to={item.to} className="text-sm font-medium">
                        {item.label}    
                    </Link>    
                </li>
            ))}
        </ul>
    )
}



export default Menu;