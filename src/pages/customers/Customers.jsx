import React from "react";
import {useState} from "react";
import Button from "../../components/ui/Button";
import { IoCloseOutline } from "react-icons/io5";
import Label from "../../components/ui/Label";
import useForm from "../../hooks/Useform";

const Customers = () =>{
    const [inVoice, setInVoiceOpen] = useState(false);

    //tsongaina anaty useFrom ny données, asina valeur par defaut useForm
    //au lieu de useForm().formData
    const {formData, handleChange, handleSubmit, errors } = useForm({
        billFrom: "senpai",
        billTo:"",
        recipientEmail:"",
        phoneNumber:"",
        address:"",
        issuedOn:"",
        itemName: "",
        price: "",
        quantity: "",
        totalPrice: "",
    });


    const handleInvoice = () =>{
        setInVoiceOpen(true);
    }

    const closePopup = () =>{
        setInVoiceOpen(false)
    }

    //refa alefa ilay formulaire
    const onSubmit = (e) =>{
        e.preventDefault();
        //antsoina ilay handlesubmit miaraka am url
        handleSubmit("http://localhost:8080/Vente")
            .then((data) => {
                console.log("facture crée avec succes", data);
                setInVoiceOpen(false);
            })
            .catch((Error) =>{
                console.error('erreur lors de la soumission', Error);
            })
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
                    <form className="bg-white p-7 lg:max-w-xl rounded-xl shadow-lg relative">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-semibold">Create New Invoice</h2>
                            <IoCloseOutline className="text-2xl" onClick={closePopup} />
                        </div>
                        <h1 className="text-2xl font-bold">Invoice #</h1>
                        <h3 className="font-bold mb-5">Details</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <Label text="Bill From" value={formData.billFrom} disabled />
                                <Label
                                 text="Bill To" 
                                 placeholder="ex: yamada"
                                 value={formData.billTo}
                                 //fatatra oe inona ilay vokitika
                                 name="billTo"
                                 onChange={handleChange}
                                 />
                            </div>
                            <Label
                                text="Recipient Email"
                                placeholder=" ex : senpai@gmail.com"
                                name="recipientEmail"
                                value={formData.recipientEmail}
                                onChange={handleChange}
                                />
                            <div>
                                <label className="block text-gray-700 font-thin mb-1">Phone Number / Address</label>
                                <Label
                                    placeholder="Enter customer number"
                                    value={formData.phoneNumber}
                                    name="phoneNumber"
                                    onChange={handleChange}
                                    />
                                    
                                <Label placeholder="Enter customer address"
                                    value={formData.address}
                                    name="address"
                                    onChange={handleChange}/>
                            </div>
                            <label className="text-lg">Issued on </label> 
                            <input type="date"
                                onChange={handleChange}
                                value={formData.issuedOn}
                                name="issuedOn"
                            />
                            <h1 className="my-5 font-bold">Invoice Item</h1>
                            <table className="my-10 flex-1">
                                <thead>
                                    <tr className="text-left">
                                        <th className="font-thin">Reference</th>
                                        <th className="font-thin">Price</th>
                                        <th className="font-thin">Quantity</th>
                                        <th className="font-thin">Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-left">
                                        <td><Label
                                            inputClassName="border-none"
                                            placeholder="Item Name"
                                            name="itemName"
                                            onChange={handleChange}
                                            value={formData.itemName}      
                                            />
                                            
                                        </td>
                                        <td><Label 
                                            inputClassName="border-none"
                                            placeholder="£20"
                                            name="price"
                                            onChange={handleChange}
                                            value={formData.price}
                                         />
                                         </td>
                                        <td><Label 
                                            inputClassName="border-none"
                                            placeholder="2"
                                            name="quantity"
                                            onChange={handleChange}
                                            value={formData.quantity}
                                         />
                                         </td>
                                        <td><Label 
                                            inputClassName="border-none" 
                                            placeholder="£40"
                                            name="totalPrice"
                                            onChange={handleChange}
                                            value={formData.totalPrice}
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