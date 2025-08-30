import React, { useEffect, useState } from "react";
import { IoMdArrowDropdown } from 'react-icons/io';

const tryFetch = async (candidates = []) => {
    let lastError = null;
    for (const url of candidates) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data = await res.json();
            return { data, url };
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError;
};


function parseDate(item) {
    // Tester plusieurs champs de date courants utilisés côté serveur
    const candidates = [item.Date, item.date, item.createdAt, item.CreatedAt, item.SDate, item.StartDate];
    for (const c of candidates) {
        if (!c) continue;
        const d = new Date(c);
        if (!isNaN(d)) return d;
    }
    return null;
}

// Placer `normalize` hors de useEffect pour qu'il soit disponible dans le JSX
function normalize(res) {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    // clés courantes d'encapsulation
    const commonKeys = ['value','Value','data','rows','results','items','list'];
    for (const k of commonKeys) {
        if (res[k] && Array.isArray(res[k])) return res[k];
    }
    // solution de repli : n'importe quelle propriété qui est un tableau
    for (const k of Object.keys(res)) {
        if (Array.isArray(res[k])) return res[k];
    }
    return [];
}

// Retourne le premier élément si la valeur est un tableau, sinon renvoie la valeur telle quelle
function first(v) {
    if (v == null) return undefined;
    return Array.isArray(v) ? v[0] : v;
}

// Aide pour trouver le premier champ présent parmi une liste de candidats dans un objet
function pick(obj, candidates) {
    if (!obj) return undefined;
    for (const k of candidates) {
        if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') return obj[k];
    }
    return undefined;
}

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        let mounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            // Récupérer ventes et achats depuis le serveur (endpoints explicites)
            try {
                // Utiliser l'adresse du backend explicitement (l'origine du frontend peut être différente en dev)
                const base = 'http://localhost:8080';
                const [ventesRes, achatsRes] = await Promise.all([
                    fetch(base + '/Vente').then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status} ${r.statusText}`))).catch((e) => { console.warn('fetch /Vente failed', e); return []; }),
                    fetch(base + '/Achat').then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status} ${r.statusText}`))).catch((e) => { console.warn('fetch /Achat failed', e); return []; }),
                ]);

                const ventes = normalize(ventesRes);
                const achats = normalize(achatsRes);

                // Logs de débogage pour diagnostiquer des résultats vides
                console.debug('History fetch:', { ventesRaw: ventesRes, achatsRaw: achatsRes });
                console.info(`Fetched ventes: ${ventes.length}, achats: ${achats.length}`);

                const merged = [];

                ventes.forEach((v, i) => {
                    merged.push({
                        id: v.IdVente || v.Id || `vente-${i}`,
                        type: "Vente",
                        raw: v,
                        date: parseDate(v) || new Date(),
                    });
                });

                achats.forEach((a, i) => {
                    merged.push({
                        id: a.IdAchat || a.Id || `achat-${i}`,
                        type: "Achat",
                        raw: a,
                        date: parseDate(a) || new Date(),
                    });
                });

                merged.sort((a, b) => b.date - a.date);

                if (mounted) setHistory(merged);
            } catch (err) {
                if (mounted) setError(err.message || String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-semibold mb-4">Historique des transactions</h1>

            

            {loading && <div className="text-gray-500">Chargement...</div>}
            {error && <div className="text-red-600">Erreur: {error}</div>}

            {!loading && history.length === 0 && !error && (
                <div className="text-gray-600">Aucune transaction trouvée.</div>
            )}

            {!loading && history.length > 0 && (
                <div className="overflow-x-auto bg-white rounded shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Résumé</th>
                                <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.map((h) => {
                                const raw = h.raw || {};
                                const prod = first(raw.produit) ?? { Description: raw.NomProduit ?? raw.CodeProduit };
                                const quantite = raw.Quantite ?? raw.Quantity ?? raw.Qty ?? '-';
                                const fact = first(raw.facture);
                                const client = first(fact?.client) ?? { Nom: raw.ClientName, Tel: raw.ClientTel ?? raw.Tel, Adresse: raw.ClientAdresse ?? raw.Adresse, Email: raw.ClientEmail ?? raw.Email };

                                // Normalize fournisseur: try included object first, then multiple fallback keys
                                const includedFournisseur = first(raw.fournisseur);
                                let fournisseur = {};
                                if (includedFournisseur) {
                                    fournisseur.Entreprise = pick(includedFournisseur, ['Entreprise', 'Nom', 'name']);
                                    const tel = pick(includedFournisseur, ['Telephone', 'telephone', 'Phone', 'phone', 'Tel']);
                                    fournisseur.Telephone = tel !== undefined ? String(tel) : undefined;
                                    fournisseur.Email = pick(includedFournisseur, ['Email', 'email']);
                                }
                                // global fallbacks from achat payload or top-level fields
                                fournisseur.Entreprise = fournisseur.Entreprise ?? pick(raw, ['InfoFournisseur', 'FournisseurName', 'Entreprise']);
                                fournisseur.Telephone = fournisseur.Telephone ?? pick(raw, ['FournisseurTel', 'Telephone', 'Tel']);
                                if (fournisseur.Telephone !== undefined) fournisseur.Telephone = String(fournisseur.Telephone);
                                fournisseur.Email = fournisseur.Email ?? pick(raw, ['FournisseurEmail', 'Email', 'email']);

                                // debug if phone/email missing
                                if ((!fournisseur.Telephone || !fournisseur.Email) && includedFournisseur) {
                                    console.debug('fournisseur included raw:', includedFournisseur);
                                }

                                const onToggle = () => toggleExpand(h.id);

                                return (
                                    <React.Fragment key={h.id}>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-700">{h.date ? h.date.toLocaleString() : '-'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${h.type === 'Vente' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {h.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {/* Résumé : produit + quantité */}
                                                <div>
                                                    <div className="font-medium">Produit: {prod?.Description ?? prod?.Nom ?? '-'}</div>
                                                    <div className="text-sm text-gray-500">Quantite:  {quantite}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-center align-middle">
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <button
                                                        onClick={onToggle}
                                                        title={expanded[h.id] ? 'Masquer' : 'Voir'}
                                                        aria-expanded={!!expanded[h.id]}
                                                        className="inline-flex items-center px-3 py-1 rounded hover:bg-gray-100 focus:outline-none"
                                                    >
                                                        <span className="text-sm font-medium mr-2">Voir</span>
                                                        <IoMdArrowDropdown className={`text-xl transform transition-transform duration-150 ${expanded[h.id] ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {expanded[h.id] && (
                                                        <div className="mt-3 w-full max-w-xs bg-gray-50 border rounded p-3 text-sm text-left">
                                                            {h.type === 'Vente' ? (
                                                                <div className="space-y-1">
                                                                    <div className="font-medium">Client</div>
                                                                    <div><strong>Nom:</strong> {client?.Nom ?? '-'}</div>
                                                                    <div><strong>Tél:</strong> {client?.Tel ?? '-'}</div>
                                                                    <div><strong>Adresse:</strong> {client?.Adresse ?? '-'}</div>
                                                                    <div><strong>Email:</strong> {client?.Email ?? '-'}</div>
                                                                    <div className="mt-1"><strong>Num Employé:</strong> {raw.NumEmploye ?? '-'}</div>
                                                                    <div><strong>Num Facture:</strong> {raw.NumFacture ?? raw.Num ?? '-'}</div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <div className="font-medium">Fournisseur</div>
                                                                    <div><strong>Nom:</strong> {fournisseur?.Entreprise ?? '-'}</div>
                                                                    <div><strong>Tél:</strong> {fournisseur?.Telephone ?? '-'}</div>
                                                                    <div><strong>Email:</strong> {fournisseur?.Email ?? '-'}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* inline details only - modal removed */}
        </div>
    );
};

export default History;