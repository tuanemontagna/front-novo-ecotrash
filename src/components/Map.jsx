"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { Clock, Recycle, MapPin } from "lucide-react";

const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#48742c" stroke="#2d5016" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export default function Map({ pontos }) {
  // Default center (Brazil)
  const defaultCenter = [-14.2350, -51.9253]; 
  const customIcon = createCustomIcon();
  
  return (
    <MapContainer center={defaultCenter} zoom={4} scrollWheelZoom={true} style={{ height: "100%", width: "100%", borderRadius: "1rem" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {pontos.map((p) => {
        const lat = p.endereco?.latitude ? Number(p.endereco.latitude) : null;
        const lng = p.endereco?.longitude ? Number(p.endereco.longitude) : null;

        if (lat && lng) {
            return (
                <Marker key={p.id} position={[lat, lng]} icon={customIcon}>
                  <Popup className="custom-popup">
                    <div className="p-2 min-w-[200px]">
                        <h3 className="font-bold text-[#2d5016] text-base mb-1">{p.nomePonto}</h3>
                        <p className="text-xs font-semibold text-zinc-500 mb-2">{p.empresa?.nomeFantasia}</p>
                        
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 text-xs text-zinc-700">
                                <MapPin size={14} className="mt-0.5 shrink-0 text-[#48742c]" />
                                <span>
                                    {p.endereco.logradouro}, {p.endereco.numero}
                                    {p.endereco.complemento && ` - ${p.endereco.complemento}`}<br/>
                                    {p.endereco.bairro}, {p.endereco.cidade} - {p.endereco.estado}
                                </span>
                            </div>

                            {p.horarioFuncionamento && (
                                <div className="flex items-start gap-2 text-xs text-zinc-700">
                                    <Clock size={14} className="mt-0.5 shrink-0 text-[#48742c]" />
                                    <span className="whitespace-pre-line">{p.horarioFuncionamento}</span>
                                </div>
                            )}

                            {p.tiposResiduosAceitos && p.tiposResiduosAceitos.length > 0 && (
                                <div className="flex items-start gap-2 text-xs text-zinc-700">
                                    <Recycle size={14} className="mt-0.5 shrink-0 text-[#48742c]" />
                                    <div className="flex flex-wrap gap-1">
                                        {p.tiposResiduosAceitos.map(t => (
                                            <span key={t.id} className="bg-green-50 text-green-800 px-1.5 py-0.5 rounded border border-green-100">
                                                {t.nome}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                  </Popup>
                </Marker>
            );
        }
        return null;
      })}
    </MapContainer>
  );
}
