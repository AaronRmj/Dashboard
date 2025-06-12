import React, { useEffect, useState, useRef } from "react";
import jsQR from "jsqr";
import {jwtDecode} from "jwt-decode";

const PresenceScanner = ({ token }) => {
  const [nomEntreprise, setNomEntreprise] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureConfirmée, setHeureConfirmée] = useState(null);
  const [scannedData, setScannedData] = useState("");
  const [presentEmails, setPresentEmails] = useState([]);
  const [retardataires, setRetardataires] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanningRef = useRef(false);
  const scanCooldownRef = useRef(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setNomEntreprise(decoded.entreprise || "");
      } catch (error) {
        setMessage({ text: "Erreur de décodage du token.", type: "error" });
      }
    }
  }, [token]);

  const tick = () => {
    if (!scanningRef.current) return;

    const video = videoRef.current;
    if (video && video.readyState === 4) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        if (!scanCooldownRef.current && code.data !== scannedData) {
          setScannedData(code.data);
          handleScanResult(code.data);
          scanCooldownRef.current = true;
          setTimeout(() => {
            scanCooldownRef.current = false;
          }, 2000);
        }
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
      } catch (error) {
        setMessage({ text: "Erreur d'accès à la caméra.", type: "error" });
        scanningRef.current = false;
      }
    };

    startCamera();

    return () => {
      scanningRef.current = false;
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [heureConfirmée]);

  const heureStringToMinutes = (hStr) => {
    const [h, m] = hStr.split(":").map(Number);
    return h * 60 + m;
  };

  const handleScanResult = async (email) => {
    try {
    
      const res = await fetch("http://localhost:8080/Employe/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.exists) {
        setMessage({ text: "Email non reconnu dans la base des employés.", type: "warning" });
        return;
      }

      const current = new Date();
      const currentMinutes = current.getHours() * 60 + current.getMinutes();
      const heureConfirmeeMinutes = heureStringToMinutes(heureConfirmée);

      const isAlreadyPresent = presentEmails.includes(email);
      const isAlreadyRetard = retardataires.includes(email);

      if (currentMinutes <= heureConfirmeeMinutes) {
        if (!isAlreadyPresent && !isAlreadyRetard) {
          setPresentEmails((prev) => [...prev, email]);
          setMessage({ text: "Présence enregistrée.", type: "success" });
        } else if (isAlreadyPresent) {
          setMessage({ text: "Employé déjà marqué présent.", type: "info" });
        } else if (isAlreadyRetard) {
          setMessage({ text: "Employé déjà marqué en retard, impossible de le reclasser.", type: "info" });
        }
      } else {
        if (!isAlreadyRetard && !isAlreadyPresent) {
          setRetardataires((prev) => [...prev, email]);
          setMessage({ text: "Employé en retard enregistré.", type: "warning" });
        } else if (isAlreadyRetard) {
          setMessage({ text: "Employé déjà marqué en retard.", type: "info" });
        } else if (isAlreadyPresent) {
          setMessage({ text: "Employé déjà marqué présent, impossible de le reclasser.", type: "info" });
        }
      }
    } catch (error) {
      setMessage({ text: "Erreur lors de la vérification de l'email.", type: "error" });
    }
  };

  const handleStartScan = () => {
    if (!heureDebut) {
      setMessage({ text: "Veuillez saisir l'heure de début.", type: "error" });
      return;
    }
    setHeureConfirmée(heureDebut);
    setMessage({ text: "Scan démarré.", type: "success" });
  };

  const handleStopScan = () => {
    scanningRef.current = false;
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setHeureConfirmée(null);
    setScannedData("");
    setMessage({ text: "Scan arrêté.", type: "info" });
    setPresentEmails([]);
    setRetardataires([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans bg-white shadow-md rounded-lg">
      <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">Effectuation de Présence</h2>

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

      {!heureConfirmée ? (
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center mb-8">
          <input
            type="time"
            value={heureDebut}
            onChange={(e) => setHeureDebut(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleStartScan}
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
          >
            Confirmer & Scanner
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">QR Code détecté :</h3>
              <input
                type="text"
                value={scannedData}
                readOnly
                className="w-full border border-gray-300 p-2 rounded bg-gray-100 mb-3"
              />
              <button
                onClick={() => scannedData && handleScanResult(scannedData)}
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

            <div className="flex justify-center items-center">
              <video
                ref={videoRef}
                className="w-full max-w-md border-4 border-blue-500 rounded-lg shadow-lg"
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* Tableaux Présents & Retardataires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h4 className="text-lg font-semibold text-green-700 mb-3">Présents ({presentEmails.length})</h4>
              {presentEmails.length === 0 ? (
                <p className="text-gray-500 italic">Aucun présent pour l'instant.</p>
              ) : (
                <table className="min-w-full border border-gray-300 rounded overflow-hidden shadow-sm">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="text-left px-4 py-2 border-b border-green-300">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presentEmails.map(email => (
                      <tr key={email} className="hover:bg-green-50">
                        <td className="px-4 py-2 border-b border-green-200">{email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-yellow-700 mb-3">Retardataires ({retardataires.length})</h4>
              {retardataires.length === 0 ? (
                <p className="text-gray-500 italic">Aucun retardataire pour l'instant.</p>
              ) : (
                <table className="min-w-full border border-gray-300 rounded overflow-hidden shadow-sm">
                  <thead className="bg-yellow-100">
                    <tr>
                      <th className="text-left px-4 py-2 border-b border-yellow-300">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retardataires.map(email => (
                      <tr key={email} className="hover:bg-yellow-50">
                        <td className="px-4 py-2 border-b border-yellow-200">{email}</td>
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
