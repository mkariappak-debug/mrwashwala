import React, { useCallback, useState } from "react";
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from "@react-google-maps/api";

// Reads the key the project already reserves an env slot for (see
// client/.env.example). Left blank, the map below stays on the free,
// key-less embed so nothing breaks for anyone who hasn't configured it yet.
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").trim();

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 12.2921, lng: 76.6126 };
const maxZoom = 16;

// Hide default POI/transit pins so only our two branch markers ever appear
// on the map, per the "no extra pins" requirement.
const mapOptions = {
  fullscreenControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  clickableIcons: false,
  styles: [
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
  ]
};

function EmbedFallback({ src }) {
  return (
    <iframe
      title="Mr. WashWala locations"
      src={src}
      width="100%"
      height="100%"
      style={{ border: 0, display: "block" }}
      loading="lazy"
    />
  );
}

function InteractiveGoogleMap({ branches }) {
  const [activeBranchId, setActiveBranchId] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "mrwashwala-branches-map",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const onLoad = useCallback(
    (map) => {
      if (!branches.length) return;

      if (branches.length === 1) {
        map.setCenter({ lat: branches[0].latitude, lng: branches[0].longitude });
        map.setZoom(14);
        return;
      }

      const bounds = new window.google.maps.LatLngBounds();
      branches.forEach((branch) => {
        bounds.extend({ lat: branch.latitude, lng: branch.longitude });
      });
      map.fitBounds(bounds, 80);

      window.google.maps.event.addListenerOnce(map, "idle", () => {
        if (map.getZoom() > maxZoom) {
          map.setZoom(maxZoom);
        }
      });
    },
    [branches]
  );

  if (!isLoaded) {
    return <div className="map-loading">Loading map…</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      onLoad={onLoad}
      center={defaultCenter}
      zoom={12}
      options={mapOptions}
    >
      {branches.map((branch) => (
        <MarkerF
          key={branch.id}
          position={{ lat: branch.latitude, lng: branch.longitude }}
          title={branch.name}
          onClick={() =>
            setActiveBranchId((current) => (current === branch.id ? null : branch.id))
          }
        >
          {activeBranchId === branch.id && (
            <InfoWindowF onCloseClick={() => setActiveBranchId(null)}>
              <div className="map-infowindow">
                <strong>{branch.name}</strong>
                <p>{branch.address.full}</p>
              </div>
            </InfoWindowF>
          )}
        </MarkerF>
      ))}
    </GoogleMap>
  );
}

export default function BranchesMap({ branches, fallbackSrc }) {
  // No API key configured yet -> keep using the existing no-key embed so
  // the section keeps working exactly as before.
  if (!GOOGLE_MAPS_API_KEY) {
    return <EmbedFallback src={fallbackSrc} />;
  }

  return <InteractiveGoogleMap branches={branches} />;
}
