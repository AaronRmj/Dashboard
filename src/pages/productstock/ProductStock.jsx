import React, { useState, useEffect } from "react";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";

const ProductsStock = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProduits = async () => {
            try {
                const response = await fetch("http://localhost:8080/Produit");
                if (!response.ok) throw new Error("Erreur lors de la récupération des produits");
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Erreur :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduits();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const filteredProducts = products.filter(product =>
        product.Description.toLowerCase().includes(searchTerm)
    );

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <div className="h-16 w-16 inline-block rounded-full border-4 border-t-transparent border-gray-400 border-solid spinner-border animate-spin"></div>
                </div>
            ) : (
                <section className="container mx-auto">
                    {/* Barre de recherche */}
                    <div className="flex justify-center my-4">
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="border border-gray-300 rounded px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Pour mobile design */}
                    <div className="block md:hidden">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.IdProduit} className="bg-white relative m-5 rounded-lg shadow-md flex space-x-7 items-center px-7 py-4">
                                    <div>
                                        <h1 className="font-bold text-md">{product.Description}</h1>
                                        <h2 className="text-gray-500 text-sm">{product.category}</h2>
                                        <p className="text-blue-600 text-lg">{product.PVunitaire}$</p>
                                        <p className="text-sm">Count: {product.Stock}</p>
                                    </div>
                                    <div className="space-y-2 absolute right-6">
                                        <CiEdit className="h-6 w-6"/>
                                        <RiDeleteBin6Line className="h-6 w-6"/>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Aucun résultat trouvé.</p>
                        )}
                    </div>

                    {/* Pour grand écran */}
                    <section className="bg-white rounded-xl lg:m-5 p-4">
                        <div className="hidden md:block overflow-hidden rounded-xl">
                            <table className="w-full border-collapse border-gray-300">
                                <thead>
                                    <tr className="text-left">
                                        <th className="p-2">Product</th>
                                        <th className="p-2">Category</th>
                                        <th className="p-2">Price</th>
                                        <th className="p-2">Items</th>
                                        <th className="p-2 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <tr key={product.IdProduit} className="border-b border-gray-200">
                                                <td className="py-3 px-6 flex items-center gap-4 text-sm font-bold">
                                                    <img src={product.image} className="h-12 w-12 mr-6" alt="pd-img" />
                                                    {product.Description}
                                                </td>
                                                <td className="text-gray-500 text-sm">{product.category}</td>
                                                <td className="text-blue-600 text-sm">{product.PVunitaire}$</td>
                                                <td className="text-center">{product.Stock}</td>
                                                <td className="md:flex justify-center space-x-2 cursor-pointer">
                                                    <CiEdit className="text-gray-600 h-5 w-5"/>
                                                    <RiDeleteBin6Line className="h-5 w-5 text-red-500"/>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-gray-500 py-4">Aucun résultat trouvé.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </section>
            )}
        </div>
    );
};

export default ProductsStock;
