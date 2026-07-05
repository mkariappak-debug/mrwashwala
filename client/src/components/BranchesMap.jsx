import React, { useCallback, useState } from "react";
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from "@react-google-maps/api";

// Reads the key the project already reserves an env slot for (see
// client/.env.example). Left blank, the map below stays on the free,
// key-less embed so nothing breaks for anyone who hasn't configured it yet.
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").trim();

const mapContainerStyle = { width: "100%", height: "100%" };
const BRANCH_PIN_COLORS = ["#27187E", "#0E9F6E"];
const buildBranchPinIcon = (color) => ({
  path: "M12 2C7.03 2 3 6.03 3 11c0 6.3 6.7 10.8 8.54 12.04.48.34 1.1.34 1.58 0C14.3 21.8 21 17.3 21 11c0-4.97-4.03-9-9-9zm0 12a3 3 0 110-6 3 3 0 010 6z",
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "#ffffff",
  strokeWeight: 2,
  scale: 1.4,
  anchor: { x: 12, y: 24 }
});

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

  // Fit the viewport to both branch pins automatically instead of relying
  // on a fixed zoom level, so both markers are always visible together.
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
      map.fitBounds(bounds, 60);
    },
    [branches]
  );

  if (!isLoaded) {
    return <div className="map-loading">Loading map…</div>;
  }

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} onLoad={onLoad} options={mapOptions}>
      {branches.map((branch, index) => (
        <MarkerF
          key={branch.id}
          position={{ lat: branch.latitude, lng: branch.longitude }}
          title={branch.name}
          icon={buildBranchPinIcon(BRANCH_PIN_COLORS[index % BRANCH_PIN_COLORS.length])}
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
