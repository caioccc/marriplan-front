import React from "react";
import {
  MapContainer as LeafletMap,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

interface LeafletMapProps {
  mapPosition: [number, number] | null;
  setMapPosition: (pos: [number, number]) => void;
  reverseGeocode: (lat: number, lng: number) => Promise<Record<string, unknown>>;
  form: {
    setFieldValue: (field: string, value: unknown) => void;
    values: {
      cep?: string | null;
    };
  };
  L: {
    icon: (options: {
      iconUrl: string;
      iconSize: [number, number];
      iconAnchor: [number, number];
    }) => unknown;
  } | null;
}

const LeafletMapComponent: React.FC<LeafletMapProps> = ({
  mapPosition,
  setMapPosition,
  reverseGeocode,
  form,
  L,
}) => {
  function LocationMarker() {
    // useMapEvents deve ser chamado sempre
    useMapEvents({
      click(e) {
        setMapPosition([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng).then((addr) => {
          if (addr) {
            form.setFieldValue("endereco", addr.road || "");
            form.setFieldValue(
              "bairro",
              addr.suburb ||
                addr.neighbourhood ||
                addr.village ||
                addr.town ||
                "",
            );
            form.setFieldValue(
              "cidade",
              addr.city || addr.town || addr.village || "",
            );
            form.setFieldValue("estado", addr.state || "");
            form.setFieldValue("numero", addr.house_number || "");
            form.setFieldValue("cep", addr.postcode || form.values.cep || "");
            form.setFieldValue("latitude", e.latlng.lat);
            form.setFieldValue("longitude", e.latlng.lng);
          }
        });
      },
    });
    // Só renderiza o marker se houver posição e L
    if (!mapPosition || !L) return null;
    return (
      <Marker
        position={mapPosition}
        icon={L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      />
    );
  }

  if (typeof window === "undefined") return null;
  return (
    <div
      style={{
        height: 260,
        width: "100%",
        marginBottom: 16,
        marginTop: 16,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <LeafletMap
        center={mapPosition || [-14.235, -51.9253]}
        zoom={mapPosition ? 16 : 4}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </LeafletMap>
    </div>
  );
};

export default LeafletMapComponent;
