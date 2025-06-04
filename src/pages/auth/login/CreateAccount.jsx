import React from "react";
import { Link } from "react-router-dom";

const CreateAccount = () => {
  return (
    <div className="flex justify-between items-center mt-4 w-full px-1 text-sm text-gray-800">
      <p className="font-light">
        Vous n’avez pas de compte ?{" "}
        
      </p><Link to="/signup" className="text-blue-600  hover:text-gray-500 hover:scale-102 transition-all duration-[600ms]">
          Créer un compte
        </Link>
    
    </div>
  );
};

export default CreateAccount;
