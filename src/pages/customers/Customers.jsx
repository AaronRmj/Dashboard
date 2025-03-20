import React from "react";
import {useState} from "react";
import Button from "../../components/ui/Button";
import { IoCloseOutline } from "react-icons/io5";
import Label from "../../components/ui/Label";


const Customers = () =>{
    const [inVoice, setInVoiceOpen] = useState(false);

    const [formData, setFormData] = useState({
        Client:{
            Nom:"",
            Telephone:"",
            Adresse:"",
            Email:"",
        },
        Produit:{
            Quantite:"",
            Date:"",
            CodeProduit:"",
            NumEmploye:""   
        },
    })
    


    const handleChange = (e) =>{
        const {name,value} = e.target;
        setFormData((prev) =>{
            // Si `name` est un des éléments dans le tableau, exécute ce bloc
            if (["Nom","Adresse", "Email"].includes(name)){
                return { ...prev, Client:{...prev.Client, [name]:value }};
            }
            
            if (["Telephone"].includes(name)){
                return {...prev, Client:{...prev.Client, [name]:parseInt(value,10) || 0}};
            }

            if (["Date"].includes(name)){
                return{...prev, Produit:{...prev.Produit, [name]:value}}
            }

            if (["Quantite", "CodeProduit", "NumEmploye"].includes(name))
                return { ...prev, Produit:{...prev.Produit, [name]:parseInt(value, 10) || 0 }};
            return {...prev, [name]:value};
        })
    }

    const handleInvoice = () =>{
        setInVoiceOpen(true);
    }

    const closePopup = () =>{
        setInVoiceOpen(false)
    }

    //refa alefa ilay formulaire
    const onSubmit = async (e) =>{
        e.preventDefault();
        const test = JSON.stringify(formData);
        console.log(test);
        try{
            const response = await fetch('http://localhost:8080/Vente',{
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),

            })
            if (!response.ok) {
                throw new Error("Erreur lors de la création de la facture");
            }

            const data = await response.json();
            console.log("facture crée avec succes", data);
            setInVoiceOpen(false);
        }
        catch (error) {
            console.error("Erreur de la soumission",error);
        }
    }

    return(
        <section>
            {!inVoice ? (
                
                //ra false ilay inVoice dia tsisy retour
                <section className="mx-auto space-x-6 lg:max-w-md w-2xs h-screen flex justify-between items-center" onClick={handleInvoice}>
                    <Button label="Create New Invoice"/>
                </section>
            ) : (

                //ra true ilay inVoice ilay return formulaire
                <section  className="p-3 overflow-hidden flex justify-center">
                    <form onSubmit={onSubmit} className="bg-white p-7 lg:max-w-xl rounded-xl shadow-lg relative">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-semibold">Create New Invoice</h2>
                            <IoCloseOutline className="text-2xl" onClick={closePopup} />
                        </div>
                        <h1 className="text-2xl font-bold">Invoice #</h1>
                        <h3 className="font-bold mb-5">Details</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <Label text="Bill From"  disabled />
                                <Label
                                 text="Bill To" 
                                 placeholder="ex: yamada"
                                 name="Nom"
                                 value={formData.Client.Nom}
                                 onChange={handleChange}  
                                 />
                            </div>
                            <Label
                                text="Recipient Email"
                                placeholder=" ex : senpai@gmail.com"
                                name="Email"
                                value={formData.Client.Email}
                                onChange={handleChange}
                                />
                            <div>
                                <label className="block text-gray-700 font-thin mb-1">Phone Number / Address</label>
                                <Label
                                    placeholder="Enter customer number"
                                    name="Telephone"
                                    value={formData.Client.Telephone}
                                    onChange={handleChange}
                                    
                                    />
                                    
                                <Label placeholder="Enter customer address"
                                    name="Adresse"
                                    value={formData.Client.Adresse}
                                    onChange={handleChange}
                                    />
                            </div>
                            <label className="text-lg">Issued on </label> 
                            {/* <input type="date"
                                
                            /> */}
                            <h1 className="my-5 font-bold">Invoice Item</h1>
                            <table className="my-10 flex-1">
                                <thead>
                                    <tr className="text-left">
                                        <th className="font-thin">Code Produit</th>
                                        <th className="font-thin">Date</th>
                                        <th className="font-thin">Quantity</th>
                                        <th className="font-thin">Num Employe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-left">
                                        <td><Label
                                            inputClassName="border-none"
                                            placeholder="Code Produit"
                                            name="CodeProduit"
                                            value={formData.Produit.CodeProduit}
                                            onChange={handleChange}
                                            />
                                            
                                        </td>
                                        <td><Label 
                                            inputClassName="border-none"
                                            placeholder="Date"
                                            name="Date"
                                            value={formData.Produit.Date}
                                            onChange={handleChange}
                                         />
                                         </td>
                                        <td><Label 
                                            inputClassName="border-none"
                                            placeholder="2"
                                            name="Quantite"
                                            value={formData.Produit.Quantite}
                                            onChange={handleChange}
                                                        
                                         />
                                         </td>
                                        <td><Label 
                                            inputClassName="border-none" 
                                            placeholder="Numero"
                                            name="NumEmploye"
                                            value={formData.Produit.NumEmploye}
                                            onChange={handleChange}
                                        />
                                        </td>
                                    </tr>
                                </tbody>
                                {/* <div className="flex w-60 justify-between absolute lg:right-25 mb-72">
                                        <button className="text-blue-800">+ Add item</button>
                                        <p>Total Amount</p>
                                        <p>$40</p>
                                </div> */}
                            </table>
                            <div>
                                <Button label="Create Invoice" type={onSubmit}/>
                            </div>
                    </form>
                </section>
            )}
        </section>
    )
}
export default Customers