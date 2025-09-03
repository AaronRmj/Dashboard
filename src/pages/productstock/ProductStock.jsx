import React, { useState, useEffect } from "react";
import { CiEdit } from "react-icons/ci";
import { MdInventory } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiDownload } from "react-icons/fi";

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

  // Nouvelle fonction pour forcer téléchargement du code barre
  const handleDownloadCodeBarre = async (url, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du téléchargement");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Erreur téléchargement :", error);
      alert("Impossible de télécharger le fichier.");
    }
  };

  const filteredProducts = products.filter(product =>
    product.Description.toLowerCase().includes(searchTerm)
  );

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="h-16 w-16 inline-block rounded-full border-4 border-t-transparent border-gray-400 border-solid animate-spin"></div>
        </div>
      ) : (
        <section className="container mx-auto px-4">
          {/* Barre de recherche */}
          <div className="flex justify-center my-4">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={handleSearch}
              className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Affichage Desktop */}
          <section className="bg-white rounded-xl h-[100vh] shadow-md p-4 hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-3">Image Produit</th>
                    <th className="p-3">Nom Produit</th>
                    <th className="p-3">Code QR</th>
                    <th className="p-3">Prix Vente</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.IdProduit} className="border-b hover:bg-gray-50">
                        {/* Image Produit */}
                        <td className="py-3 px-2">
                          {product.Image ? (
                            <img
                              src={`http://localhost:8080${product.Image}`}
                              alt="Produit"
                              className="h-20 w-28 object-cover rounded-md mx-auto"
                            />
                          ) : (
                            <MdInventory className="h-20 w-20 text-gray-400 mx-auto" />
                          )}
                        </td>

                        {/* Nom Produit */}
                        <td className="py-3 px-2 font-semibold text-gray-700">
                          {product.Description}
                        </td>

                        {/* Code Barre */}
                        <td className="py-3 px-2 relative group">
                          {product.CodeBarre ? (
                            <>
                              <img
                                src={`http://localhost:8080${product.CodeBarre}`}
                                alt="Code Barre"
                                className="h-35 w-47 object-contain mx-auto rounded-md"
                              />
                              <button
                                onClick={() =>
                                  handleDownloadCodeBarre(
                                    `http://localhost:8080${product.CodeBarre}`,
                                    `CodeBarre_${product.Description}.png`
                                  )
                                }
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-600 hover:text-blue-500"
                                title="Télécharger le code barre"
                              >
                                <FiDownload className="w-6 h-6" />
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">Non généré</span>
                          )}
                        </td>

                        {/* Prix de Vente */}
                        <td className="py-3 px-2 text-blue-600 font-medium">
                          {Number(product.PVunitaire).toLocaleString('fr-FR')} Ar
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-2 font-medium">
                          {product.Stock}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-2">
                          <div className="flex justify-center space-x-4">
                            <CiEdit className="h-6 w-6 text-gray-600 cursor-pointer" />
                            <RiDeleteBin6Line className="h-6 w-6 text-red-500 cursor-pointer" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-500">
                        Aucun résultat trouvé.
                      </td>
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
