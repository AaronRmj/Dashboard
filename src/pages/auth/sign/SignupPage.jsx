import React from "react";
import sin from "../../../assets/images/sin.png"
import DynamicInput from "../../../components/ui/DynamicInput";
import Button from "../../../components/ui/Button"
import { CiUser } from "react-icons/ci";    //satria ato no ampiasaina
import { CiUnlock } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";
import { MdAddBusiness } from "react-icons/md";
import { Link } from "react-router-dom";

const SignupPage = () =>{
    return(
        <section className="h-screen bg-gradient-to-r from-blue-50 to-gray-100 flex justify-center items-center">
            {/* overflow hidden factor x pour que l illustration (children) ne depasse pas l element parent */}
            <div className="grid grid-cols-2 w-3/4 shadow-md relative bg-white rounded-lg overflow-hidden">
                <div className="p-10 space-y-7 h-full">
                    <div className="pt-4">
                        <h1 className="text-center text-3xl font-thin tracking-wide">Créer un compte</h1>
                        <h3 className="text-center">Unifiez vos tâches, améliorez votre performance </h3>
                    </div>
                    <div className="w-full">
                        <DynamicInput 
                            icon={CiUser}
                            type="text"
                            placeholder="Nom d'utilisateur"
                            />
                        <DynamicInput 
                            icon={CiUnlock}
                            type="password"
                            placeholder="Mot de passe"
                            />
                        <DynamicInput 
                            icon={MdOutlineEmail}
                            type="email"
                            placeholder="Email"
                            />
                        <DynamicInput
                            icon={MdAddBusiness}
                            type="text"
                            placeholder="Nom d'entreprise"
                            /> 
                    </div>
                    <Button 
                        label="Sign up" 
                    />
                    <h1 className="text-sm text-gray-400">Vous avez un compte ? <Link to="/login" className="text-gray-800 underline">Se connecter</Link> </h1>
                </div>
                <div>
                    <img src={sin} alt="illustration" className="w-full h-full object-contain" />
                </div>
            </div>
        </section>
    )
}

export default SignupPage