import React from "react";
import {useState} from "react";
import Button from "../../components/ui/Button";
import { IoCloseOutline } from "react-icons/io5";
import Label from "../../components/ui/Label";

const StockSuppliers = () =>{
    const [inVoice, setInVoiceOpen] = useState(false);
    const [formData, setFormData] = useState(false);
    const [error, setError] = useState(false);

    const handleInvoice = () =>{
        setInVoiceOpen(true);
    }

    const closePopup = () =>{
        setInVoiceOpen(false)
    }

    return(
        <section>
            {!inVoice ? (
                
                //ra false ilay inVoice dia tsisy retour
                <section className="mx-auto lg:max-w-md w-2xs h-screen flex items-center" onClick={handleInvoice}>
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
                                <Label text="Bill From" placeholder="ex : senpai" />
                                <Label text="Bill To" placeholder="ex: yamada" />
                            </div>
                            <Label text="Recipient Email" placeholder=" ex : senpai@gmail.com" />
                            <Label text="Bill Title/Project Descriptions" placeholder="Project name" />
                            <label className="text-lg">Issued on </label> 
                            <input type="date"/>
                            <h1 className="my-5 font-bold">Invoice Item</h1>
                            <table className="my-10 flex-1">
                                <thead>
                                    <tr className="text-left">
                                        <th className="font-thin">Item Name</th>
                                        <th className="font-thin">Price</th>
                                        <th className="font-thin">Quantity</th>
                                        <th className="font-thin">Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-left">
                                        <td><Label inputClassName="border-none" placeholder="Item Name"/></td>
                                        <td><Label inputClassName="border-none" placeholder="£20"/></td>
                                        <td><Label inputClassName="border-none" placeholder="2"/></td>
                                        <td><Label inputClassName="border-none" placeholder="£40"/></td>
                                    </tr>
                                </tbody>
                                <div className="flex w-60 justify-between absolute lg:right-25 mb-72">
                                        <button className="text-blue-800">+ Add item</button>
                                        <p>Total Amount</p>
                                        <p>$40</p>
                                </div>
                            </table>
                            <div className="">
                                <Button label="Create Invoice" />
                            </div>
                    </form>
                </section>
            )}
        </section>
    )
}
export default StockSuppliers