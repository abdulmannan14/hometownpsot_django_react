import { useEffect, useRef } from "react";

/**
 * Wraps a text input with Google Places Autocomplete.
 *
 * Props:
 *  - value / onChange   : controlled input
 *  - onPlaceSelect(data): called when the user picks a suggestion.
 *      data = { location, city, latitude, longitude, formatted_address }
 *  - style, placeholder, required, className : forwarded to the <input>
 */
export default function LocationAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  style,
  placeholder = "Start typing an address or venue…",
  required = false,
  className = "input w-full",
}) {
  const inputRef  = useRef(null);
  const acRef     = useRef(null);   // autocomplete instance

  useEffect(() => {
    let interval;

    const init = () => {
      if (!window.google?.maps?.places || !inputRef.current) return;
      clearInterval(interval);

      acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["establishment", "geocode"],
      });

      // Prevent the form from submitting when user presses Enter in the dropdown
      inputRef.current.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const items = document.querySelectorAll(".pac-item");
          if (items.length) e.preventDefault();
        }
      });

      acRef.current.addListener("place_changed", () => {
        const place = acRef.current.getPlace();
        if (!place?.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Pull city from address_components (prefer locality, fall back to admin_area_2)
        let city = "";
        for (const comp of place.address_components || []) {
          if (comp.types.includes("locality")) { city = comp.long_name; break; }
          if (comp.types.includes("administrative_area_level_2")) city = comp.long_name;
        }

        onPlaceSelect({
          location: place.name || place.formatted_address,
          city,
          latitude: lat,
          longitude: lng,
          formatted_address: place.formatted_address,
        });
      });
    };

    if (window.google?.maps?.places) {
      init();
    } else {
      interval = setInterval(init, 250);
    }

    return () => {
      clearInterval(interval);
      if (acRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(acRef.current);
      }
    };
  }, []); // runs once on mount

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      required={required}
      className={className}
      style={style}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
}
