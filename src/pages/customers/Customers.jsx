import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";

const Customers = () => {
  const [client, setClient] = useState({ Nom: "", Email: "", Telephone: "", Adresse: "" });
  const [tempQR, setTempQR] = useState("");
  const [produits, setProduits] = useState([]);
  const [codeProduit, setCodeProduit] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [total, setTotal] = useState({ sousTotal: 0, tva: 0, total: 0 });
  const [modeClient, setModeClient] = useState("manuel");
  const [rendu, setRendu] = useState(0); // 🔹 AJOUT rendu

  // --- Scan produit ---
  const [scanningProduit, setScanningProduit] = useState(false);
  const videoProduitRef = useRef(null);
  const canvasProduitRef = useRef(null);
  const scanningProduitRef = useRef(false);
  const lastProduitScanRef = useRef(0);
  const scanLineProduitRef = useRef(0);
  const scanDirProduitRef = useRef(1);

  const startScanProduit = async () => {
    setScanningProduit(true);
    scanningProduitRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "environment" } });
      if (videoProduitRef.current) {
        videoProduitRef.current.srcObject = stream;
        videoProduitRef.current.setAttribute("playsinline", true);
        await videoProduitRef.current.play();
        requestAnimationFrame(tickProduit);
      }
    } catch {
      alert("Impossible d'accéder à la caméra");
      setScanningProduit(false);
      scanningProduitRef.current = false;
    }
  };

  const stopScanProduit = () => {
    setScanningProduit(false);
    scanningProduitRef.current = false;
    const stream = videoProduitRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    if (videoProduitRef.current) videoProduitRef.current.srcObject = null;
    if (canvasProduitRef.current) {
      const ctx = canvasProduitRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasProduitRef.current.width, canvasProduitRef.current.height);
    }
  };

  const tickProduit = (timestamp) => {
    if (!scanningProduitRef.current) return;
    const video = videoProduitRef.current;
    const canvas = canvasProduitRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = 320;
      canvas.height = 240;
      ctx.drawImage(video, 0, 0, 320, 240);

      // Ligne de scan
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanLineProduitRef.current);
      ctx.lineTo(canvas.width, scanLineProduitRef.current);
      ctx.stroke();
      scanLineProduitRef.current += 5 * scanDirProduitRef.current;
      if (scanLineProduitRef.current >= canvas.height || scanLineProduitRef.current <= 0)
        scanDirProduitRef.current *= -1;

      if (timestamp - lastProduitScanRef.current > 200) {
        lastProduitScanRef.current = timestamp;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          setCodeProduit(code.data.trim());
          stopScanProduit();
        }
      }
    }
    requestAnimationFrame(tickProduit);
  };

  // --- Scan client ---
  const videoClientRef = useRef(null);
  const canvasClientRef = useRef(null);
  const scanningClientRef = useRef(false);
  const lastClientScanRef = useRef(0);
  const scanLineClientRef = useRef(0);
  const scanDirClientRef = useRef(1);


  const validerClientAncien = async () => {
    if (!client.Email || !client.date || !client.montantDonne) {
      return alert("Veuillez remplir email, date et montant donné");
    }

    try {
      const res = await fetch("http://localhost:8080/clients/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: client.Email })
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Client non trouvé");

      // Mise à jour du client avec son Id
      setClient(prev => ({
        ...prev,
        IdClient: data.IdClient,
        Nom: data.Nom,
        Telephone: data.Tel,
        Adresse: data.Adresse
      }));

      alert("Client validé !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la vérification client");
    }
  };

  const tickClient = (timestamp) => {
    if (!scanningClientRef.current) return;
    const video = videoClientRef.current;
    const canvas = canvasClientRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = 320;
      canvas.height = 240;
      ctx.drawImage(video, 0, 0, 320, 240);

      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanLineClientRef.current);
      ctx.lineTo(canvas.width, scanLineClientRef.current);
      ctx.stroke();
      scanLineClientRef.current += 5 * scanDirClientRef.current;
      if (scanLineClientRef.current >= canvas.height || scanLineClientRef.current <= 0)
        scanDirClientRef.current *= -1;

      if (timestamp - lastClientScanRef.current > 200) {
        lastClientScanRef.current = timestamp;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          setTempQR(code.data.trim());
          stopScanClient();
        }
      }
    }
    requestAnimationFrame(tickClient);
  };

  const genererFacture = async () => {
    if (!client.Email || produits.length === 0 || !client.montantDonne) {
      return alert("Veuillez compléter les informations client et produits");
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Vous devez être connecté pour générer la facture");

      const res = await fetch("http://localhost:8080/factures", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`  
        },
        body: JSON.stringify({
          email: client.Email,
          date: client.date,
          montantDonne: client.montantDonne,
          produits
        })
      });

      if (!res.ok) {
        const data = await res.json();
        return alert(data.error || "Erreur serveur");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Facture_${client.Nom}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      // Réinitialisation
      setProduits([]);
      setCodeProduit("");
      setQuantite(1);
      setTotal({ sousTotal: 0, tva: 0, total: 0 });

    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération de la facture");
    }
  };

  // --- Ajouter produit ---
  const ajouterProduit = async () => {
    if (!codeProduit || quantite <= 0) return alert("Veuillez entrer un code produit et une quantité valide");

    const regexCode = /^[A-Za-z0-9]{3,20}$/;
    if (!regexCode.test(codeProduit)) return alert("Code produit invalide !");

    try {
      const res = await fetch(`http://localhost:8080/produits-scan/${codeProduit}`);
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Erreur lors de la recherche produit");

      if (quantite > data.Stock) return alert("Stock insuffisant !");

      setProduits(prev => {
        const index = prev.findIndex(p => p.code === data.CodeProduit);
        if (index !== -1) {
          return prev.map((p, i) => i === index ? { ...p, quantite: p.quantite + Number(quantite) } : p);
        } else {
          return [...prev, { code: data.CodeProduit, nom: data.Description, quantite: Number(quantite), prix: data.PVunitaire }];
        }
      });

      setCodeProduit("");
      setQuantite(1);
      document.getElementById("facture-section")?.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    }
  };

  // --- Calcul total ---
  useEffect(() => {
    const sousTotal = produits.reduce((sum, p) => sum + (p.prix / 1.2) * p.quantite, 0);
    const tva = sousTotal * 0.2;
    const totalFinal = produits.reduce((sum, p) => sum + p.prix * p.quantite, 0);
    setTotal({ sousTotal, tva, total: totalFinal });
  }, [produits]);

  // ---  Calcul rendu ---
  useEffect(() => {
    if (client.montantDonne) {
      setRendu(client.montantDonne - total.total);
    } else {
      setRendu(0);
    }
  }, [client.montantDonne, total]);

  const formatAriary = (value) => `${value.toLocaleString("fr-FR")} Ar`;

  //  téléchargement direct ---
  const genererCarte = async () => {
    if (!client.Nom || !client.Telephone || !client.Adresse) {
      return alert("Veuillez remplir toutes les informations du client avant de générer la carte");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8080/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(client)
      });

      if (!res.ok) {
        const data = await res.json();
        return alert(data.error || "Erreur lors de la génération du PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Carte_Client_${client.Nom}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération de la carte PDF");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
       {/* Colonne 1 - Scan Produit */}
      <div className="p-4 border rounded shadow bg-white">
        <h2 className="font-bold text-lg mb-3">Scan Produit (QR)</h2>
        <div className="relative w-full h-48 md:h-64 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
          {!scanningProduit && <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-700 font-bold">Scan arrêté</div>}
          <video ref={videoProduitRef} className="absolute w-full h-full object-cover" />
          <canvas ref={canvasProduitRef} className="absolute w-full h-full" />
        </div>
        <div className="flex gap-2 mt-3">
          {!scanningProduit ? (
            <button onClick={startScanProduit} className="bg-blue-600 text-white px-3 py-1 rounded w-full">Démarrer</button>
          ) : (
            <button onClick={stopScanProduit} className="bg-red-600 text-white px-3 py-1 rounded w-full">Arrêter scan</button>
          )}
        </div>
        <input type="text" placeholder="Code produit" value={codeProduit} onChange={(e) => setCodeProduit(e.target.value)} className="border p-2 w-full mt-3" />
        <input type="number" min="1" value={quantite} onChange={(e) => setQuantite(Number(e.target.value))} className="border p-2 w-full mt-3" />
        <button onClick={ajouterProduit} className="bg-green-600 text-white w-full py-1 mt-2 rounded">Ajouter</button>
      </div>

      {/* Colonne 2 - Client */}
<div className="p-4 border rounded shadow bg-gray-50">
  <h2 className="font-bold text-lg mb-3">Client</h2>
  <div className="flex gap-2 mb-3 flex-wrap">
    <button
      onClick={() => {
        setModeClient("nouveau");
        setClient({ Nom: "", Email: "", Telephone: "", Adresse: "" });
      }}
      className="bg-blue-500 text-white px-3 py-1 rounded"
    >
      Nouveau
    </button>
    <button
      onClick={() => setModeClient("ancien")}
      className="bg-gray-600 text-white px-3 py-1 rounded"
    >
      Ancien client
    </button>
  </div>

  {modeClient === "nouveau" ? (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        placeholder="Nom"
        value={client.Nom}
        onChange={(e) => setClient({ ...client, Nom: e.target.value })}
        className="border p-2 w-full"
      />
      <input
        type="email"
        placeholder="Email"
        value={client.Email}
        onChange={(e) => setClient({ ...client, Email: e.target.value })}
        className="border p-2 w-full"
      />
      <input
        type="text"
        placeholder="Tel"
        value={client.Telephone}
        onChange={(e) => setClient({ ...client, Telephone: e.target.value })}
        className="border p-2 w-full"
      />
      <input
        type="text"
        placeholder="Adresse"
        value={client.Adresse}
        onChange={(e) => setClient({ ...client, Adresse: e.target.value })}
        className="border p-2 w-full"
      />
      <button
        onClick={genererCarte}
        className="bg-gray-700 text-white w-full py-1 mt-2 rounded"
      >
        Carte
      </button>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <input
        type="email"
        placeholder="Email client"
        value={client.Email}
        onChange={(e) => setClient({ ...client, Email: e.target.value })}
        className="border p-2 w-full"
      />
       <input
    type="date"
    value={client.date || ""}
    onChange={(e) => setClient({ ...client, date: e.target.value })}
    className="border p-2 w-full"
  />
  <input
    type="number"
    placeholder="Montant donné par le client"
    value={client.montantDonne || ""}
    onChange={(e) => setClient({ ...client, montantDonne: Number(e.target.value) })}
    className="border p-2 w-full"
  />
      <button
  onClick={validerClientAncien}
  className="bg-green-600 text-white px-3 py-1 mt-2 rounded w-full"
>
  Valider
</button>

    </div>
  )}
</div>

      {/* Colonne 3 - Facture */}
      <div id="facture-section" className="p-4 border rounded shadow bg-white">
        <h2 className="font-bold text-lg mb-3">Facture</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300 rounded overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Produit</th>
                <th className="p-2 text-center">Qté</th>
                <th className="p-2 text-right">Prix Unitaire</th>
                <th className="p-2 text-right">Prix Total</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-2">{p.nom}</td>
                  <td className="p-2 text-center">{p.quantite}</td>
                  <td className="p-2 text-right">{formatAriary(p.prix)}</td>
                  <td className="p-2 text-right">{formatAriary(p.prix * p.quantite)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 border-t pt-2 text-right space-y-1">
          <p>Total HT: <span className="font-medium">{formatAriary(total.sousTotal)}</span></p>
          <p>TVA 20%: <span className="font-medium">{formatAriary(total.tva)}</span></p>
          <p className="font-bold text-lg">Total TTC: <span>{formatAriary(total.total)}</span></p>

          {/* 🔹 Affichage rendu */}
          <p className="font-bold text-lg">
            Rendu :{" "}
            <span className={rendu < 0 ? "text-red-600" : "text-green-600"}>
              {formatAriary(Math.abs(rendu))}
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <button onClick={genererFacture} className="bg-red-600 text-white w-full py-1 rounded">
            Facture
          </button>
          <button className="bg-blue-700 text-white w-full py-1 rounded">Mail</button>
        </div>
      </div>
    </div>
  );
};

export default Customers;
