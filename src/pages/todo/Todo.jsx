import React, { useEffect, useState, useRef } from "react";
import jsQR from "jsqr";
import * as jwtDecodeLib from "jwt-decode";
import pdfIcon from "../../assets/images/pdf.png"; 


const PresenceScanner = ({ token: propToken }) => {
  const [token, setToken] = useState(propToken || "");
  const [nomEntreprise, setNomEntreprise] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureConfirmée, setHeureConfirmée] = useState(null);
  const [heureExistante, setHeureExistante] = useState(null);
  const [scannedData, setScannedData] = useState("");
  const [presentEmployes, setPresentEmployes] = useState([]);
  const [retardataires, setRetardataires] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [exportLoading, setExportLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanningRef = useRef(false);
  const scanCooldownRef = useRef(false);
  const scanLineRef = useRef(0);
  const scanDirectionRef = useRef(1);

  const decodeToken = (t) => {
    if (!t) return null;
    try {
      return (jwtDecodeLib.default || jwtDecodeLib)(t);
    } catch (err) {
      console.error("Erreur de décodage JWT:", err);
      return null;
    }
  };

  // Chargement tooken avant toute affichage 
  useEffect(() => {
    if (!token) {
      const t = localStorage.getItem("token");
      if (!t) setMessage({ text: "Token manquant. Veuillez vous reconnecter.", type: "error" });
      else setToken(t.trim());
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const decoded = decodeToken(token);
    if (decoded) setNomEntreprise(decoded.entreprise || "");
    checkHeureDebutExistante();
    fetchPresences();
  }, [token]);

  // Vérification de hd si existant 
  const checkHeureDebutExistante = async () => {
    try {
      const res = await fetch("http://localhost:8080/heure-debut/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.exists) {
        setHeureExistante(data.heureDebut);
        setHeureConfirmée(data.heureDebut);
        setHeureDebut(data.heureDebut);
        setMessage({ 
          text: `Une fiche de présence pour aujourd'hui a déjà été initiée par un membre de votre équipe.`,
          type: "info" 
        });
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de l'heure de début:", err);
    }
  };

  // Enregistrer l'heure de début
  const saveHeureDebut = async () => {
    if (!heureDebut) {
      setMessage({ text: "Veuillez saisir l'heure de début.", type: "error" });
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/heure-debut", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ heureDebut }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error, type: "error" });
        if (data.heureDebut) {
          setHeureExistante(data.heureDebut);
          setHeureConfirmée(data.heureDebut);
          setHeureDebut(data.heureDebut);
        }
        return;
      }

      setHeureExistante(heureDebut);
      setHeureConfirmée(heureDebut);
      setMessage({ text: data.message, type: "success" });
    } catch (err) {
      console.error("Erreur:", err);
      setMessage({ text: "Erreur lors de l'enregistrement de l'heure de début.", type: "error" });
    }
  };

 
  const fetchPresences = async () => {
    try {
      const res = await fetch("http://localhost:8080/presences/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPresentEmployes(
        data
          .filter((p) => p.Statut === "present")
          .map((p) => ({
            nom: p.employe.Nom,
            username: p.employe.UserName || "-",
            tel: p.employe.Tel,
            matricule: p.employe.Matricule,
            email: p.employe.Email,
          }))
      );
      setRetardataires(
        data
          .filter((p) => p.Statut === "retard")
          .map((p) => ({
            nom: p.employe.Nom,
            username: p.employe.UserName || "-",
            tel: p.employe.Tel,
            matricule: p.employe.Matricule,
            email: p.employe.Email,
          }))
      );
    } catch (err) {
      console.error(err);
      setMessage({ text: "Erreur lors du chargement des présences.", type: "error" });
    }
  };

  const tick = () => {
    if (!scanningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && video.readyState === 4 && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const lineY = scanLineRef.current;
      context.strokeStyle = "white";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(0, lineY);
      context.lineTo(canvas.width, lineY);
      context.stroke();

      scanLineRef.current += 25 * scanDirectionRef.current;
      if (scanLineRef.current >= canvas.height || scanLineRef.current <= 0)
        scanDirectionRef.current *= -1;

      // Lecture QR code
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && !scanCooldownRef.current && code.data !== scannedData) {
        setScannedData(code.data);
        handleScanResult(code.data, true);
        scanCooldownRef.current = true;
        setTimeout(() => (scanCooldownRef.current = false), 2000);
      }
    }
    requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!heureConfirmée) return;
    scanningRef.current = true;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true);
          await videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch {
        setMessage({ text: "Erreur d'accès à la caméra.", type: "error" });
        scanningRef.current = false;
      }
    };
    startCamera();
    return () => {
      scanningRef.current = false;
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [heureConfirmée]);

  const handleScanResult = async (email, refresh = false) => {
    if (!token) {
      setMessage({ text: "Token manquant. Veuillez vous reconnecter.", type: "error" });
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/presences/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, heureDebut: heureConfirmée }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ text: data.error || "Email non reconnu.", type: "warning" });
        return;
      }

      const employeInfo = {
        nom: data.employe.nom,
        username: data.employe.username || "-",
        tel: data.employe.tel,
        matricule: data.employe.matricule,
        email: data.employe.Email,
      };

      setPresentEmployes(prev => prev.filter(e => e.email !== email));
      setRetardataires(prev => prev.filter(e => e.email !== email));

      if (data.statut === "present") setPresentEmployes(prev => [...prev, employeInfo]);
      else setRetardataires(prev => [...prev, employeInfo]);

      setMessage({
        text: `Employé ${data.statut} enregistré.`,
        type: data.statut === "retard" ? "warning" : "success",
      });

      if (refresh) fetchPresences();
    } catch {
      setMessage({ text: "Erreur lors de l'enregistrement de la présence.", type: "error" });
    }
  };

  const handleStopScan = () => {
    scanningRef.current = false;
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    setHeureConfirmée(null);
    setScannedData("");
    setMessage({ text: "Scan arrêté.", type: "info" });
  };

  const handleContinueScan = () => {
    setHeureConfirmée(heureExistante);
    setMessage({ text: "Scan continué avec l'heure existante.", type: "success" });
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const response = await fetch("http://localhost:8080/presences/export-pdf", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'export PDF");
      }

      // Récupérer le blob PDF + apres lien de téléchargement
      const blob = await response.blob();
      
       
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const today = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
      link.download = `fiche-presence-${today}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      window.URL.revokeObjectURL(url);
      
      setMessage({ text: "Fiche de présence exportée avec succès!", type: "success" });
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      setMessage({ text: "Erreur lors de l'export de la fiche de présence.", type: "error" });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans bg-white shadow-md rounded-lg">
      <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">
        Effectuation de Présence - {nomEntreprise}
      </h2>

      {message.text && (
        <div
          className={`p-3 mb-6 rounded border
            ${message.type === "error" ? "bg-red-100 text-red-700 border-red-400" : ""}
            ${message.type === "success" ? "bg-green-100 text-green-700 border-green-400" : ""}
            ${message.type === "warning" ? "bg-yellow-100 text-yellow-700 border-yellow-400" : ""}
            ${message.type === "info" ? "bg-blue-100 text-blue-700 border-blue-400" : ""}
          `}
        >
          {message.text}
        </div>
      )}
{(heureConfirmée || heureExistante) && (
  <div className="mb-6 text-center">
    <button
      onClick={handleExportPDF}
      disabled={exportLoading}
      className={`
        ${exportLoading 
          ? "bg-gray-300 cursor-not-allowed" 
          : "bg-red-500 hover:bg-red-600"
        } 
        text-white py-3 px-6 rounded-lg text-lg transition shadow-md flex items-center justify-center gap-2 mx-auto
      `}
    >
      {exportLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 
                 0 0 5.373 0 12h4zm2 5.291A7.962 
                 7.962 0 014 12H0c0 3.042 1.135 
                 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Génération PDF...
        </>
      ) : (
        <>
          <img src={pdfIcon} alt="PDF" className="w-6 h-6" />
          Exporter en PDF
        </>
      )}
    </button>
  </div>
)}

      {/* Interface conditionnelle selon l'état */}
      {!heureConfirmée ? (
        heureExistante ? (
          // Interface quand l'heure existe déjà
          <div className="text-center mb-8">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-lg text-blue-800 mb-2">
                L'heure de début a déjà été définie aujourd'hui: <strong>{heureExistante}</strong>
              </p>
              <p className="text-sm text-blue-600">
                Aucune modification n'est possible. Tous les utilisateurs de votre entreprise voient cette interface.
              </p>
            </div>
            <button
              onClick={handleContinueScan}
              className="bg-green-600 text-white py-3 px-8 rounded-lg text-lg hover:bg-green-700 transition shadow-md"
            >
              Poursuivre le Scan
            </button>
          </div>
        ) : (
          // Interface de saisie initiale
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center mb-8">
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={saveHeureDebut}
              className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
            >
              Confirmer & Scanner
            </button>
          </div>
        )
      ) : (
        // Interface de scan active
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-700">
                  <strong>Heure de début définie:</strong> {heureConfirmée}
                </p>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-gray-700">QR Code détecté :</h3>
              <input
                type="text"
                value={scannedData}
                readOnly
                className="w-full border border-gray-300 p-2 rounded bg-gray-100 mb-3"
              />
              <button
                onClick={() => scannedData && handleScanResult(scannedData, true)}
                className="bg-green-600 text-white py-2 px-5 rounded hover:bg-green-700 transition"
              >
                Valider manuellement
              </button>

              <button
                onClick={handleStopScan}
                className="mt-6 bg-red-600 text-white py-2 px-5 rounded hover:bg-red-700 transition"
              >
                Arrêter le scan
              </button>
            </div>

            <div className="relative w-full max-w-md">
              <video
                ref={videoRef}
                className="w-full border-4 border-blue-500 rounded-lg shadow-lg"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </div>
          </div>

          {/* Tableau Présents et Retardataires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h4 className="text-lg font-semibold text-green-700 mb-3">
                Présents ({presentEmployes.length})
              </h4>
              {presentEmployes.length === 0 ? (
                <p className="text-gray-500 italic">Aucun présent pour l'instant.</p>
              ) : (
                <table className="min-w-full border border-gray-300 rounded overflow-hidden shadow-sm">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-4 py-2">Nom</th>
                      <th className="px-4 py-2">Prénom(s)</th>
                      <th className="px-4 py-2">Téléphone</th>
                      <th className="px-4 py-2">Matricule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presentEmployes.map((emp) => (
                      <tr key={emp.email} className="hover:bg-green-50">
                        <td className="px-4 py-2">{emp.nom}</td>
                        <td className="px-4 py-2">{emp.username}</td>
                        <td className="px-4 py-2">{emp.tel}</td>
                        <td className="px-4 py-2">{emp.matricule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-yellow-700 mb-3">
                Retardataires ({retardataires.length})
              </h4>
              {retardataires.length === 0 ? (
                <p className="text-gray-500 italic">Aucun retardataire pour l'instant.</p>
              ) : (
                <table className="min-w-full border border-gray-300 rounded overflow-hidden shadow-sm">
                  <thead className="bg-yellow-100">
                    <tr>
                      <th className="px-4 py-2">Nom</th>
                      <th className="px-4 py-2">Prénom(s)</th>
                      <th className="px-4 py-2">Téléphone</th>
                      <th className="px-4 py-2">Matricule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retardataires.map((emp) => (
                      <tr key={emp.email} className="hover:bg-yellow-50">
                        <td className="px-4 py-2">{emp.nom}</td>
                        <td className="px-4 py-2">{emp.username}</td>
                        <td className="px-4 py-2">{emp.tel}</td>
                        <td className="px-4 py-2">{emp.matricule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PresenceScanner;