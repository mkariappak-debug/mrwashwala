import React, { useEffect, useRef, useState } from "react";
import { searchAddressSuggestions } from "../utils/geocode";

/**
 * Free-text address field with OpenStreetMap (Nominatim) suggestions.
 *
 * Why this exists: manually typed addresses are frequently informal
 * ("near SBI bank, opp big tree...") and Nominatim's free-text search often
 * can't match that to a single location, so forward-geocoding on blur can
 * silently return nothing. Picking a suggestion instead hands us exact
 * coordinates straight from the result the customer confirmed, so branch
 * recommendation is no longer dependent on guessing at typed text.
 *
 * The field still behaves like a normal controlled textarea for typing/paste,
 * and `onManualBlur` is still called on blur so free-typed addresses that are
 * never selected from the dropdown (e.g. pasted, or user ignores suggestions)
 * still get a best-effort geocode attempt as a fallback.
 */
export default function AddressAutocomplete({
  value,
  onChange,
  onSelectSuggestion,
  onManualBlur,
  onFocus,
  placeholder = "Pickup Address",
  style
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const justSelectedRef = useRef(false);
  // Tracks the currently in-flight/pending suggestion lookup so blur can wait
  // for it instead of racing it. Without this, a customer who finishes
  // typing and immediately tabs/clicks away (very common) would trigger the
  // blur fallback ~150ms later while the 400ms-debounced suggestion search
  // hadn't even started its fetch yet - the dropdown would never get a
  // chance to show real suggestions, and a weaker single-result fallback
  // geocode would run instead, often failing where the suggestion search
  // would have succeeded.
  const pendingSearchRef = useRef(null);
  // Discards a suggestion response if a newer search has since been kicked
  // off (out-of-order network responses).
  const searchTokenRef = useRef(0);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runSearch = (text) => {
    const token = ++searchTokenRef.current;

    const promise = (async () => {
      setIsSearching(true);
      try {
        const results = await searchAddressSuggestions(text);
        if (searchTokenRef.current !== token) return []; // a newer search superseded this one
        setSuggestions(results);
        setIsOpen(results.length > 0);
        return results;
      } catch (error) {
        console.error("Address suggestion lookup failed:", error);
        if (searchTokenRef.current !== token) return [];
        setSuggestions([]);
        setIsOpen(false);
        return [];
      } finally {
        if (searchTokenRef.current === token) setIsSearching(false);
      }
    })();

    pendingSearchRef.current = promise;
    return promise;
  };

  const handleChange = (e) => {
    const text = e.target.value;
    onChange(text);

    if (justSelectedRef.current) {
      // Value change came from us programmatically setting it after a
      // selection - don't immediately reopen the dropdown for it.
      justSelectedRef.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      searchTokenRef.current += 1; // invalidate any in-flight search
      pendingSearchRef.current = null;
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      runSearch(text);
    }, 400);
  };

  const handleSelect = (suggestion) => {
    justSelectedRef.current = true;
    searchTokenRef.current += 1; // invalidate any in-flight search
    pendingSearchRef.current = null;
    setIsOpen(false);
    setSuggestions([]);
    onSelectSuggestion(suggestion);
  };

  const handleBlur = () => {
    // Let a click on a suggestion register before we do anything else -
    // onMouseDown on suggestion buttons preventDefault()s to keep focus, but
    // give the click a moment to land first.
    setTimeout(async () => {
      // If a suggestion search is still in flight (the customer finished
      // typing and tabbed away faster than the debounce), wait for it
      // instead of immediately falling back - this is the fix for addresses
      // that showed suggestions when given time, but "couldn't pinpoint"
      // when the field was left quickly.
      let resolvedResults = null;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
        // The debounce never fired its fetch - run it now, immediately.
        resolvedResults = await runSearch(value);
      } else if (pendingSearchRef.current) {
        resolvedResults = await pendingSearchRef.current;
      }
      pendingSearchRef.current = null;

      setIsOpen(false);

      // If we just resolved suggestions for the customer's exact typed text
      // (rather than racing the fallback against a stale/empty list), use
      // the best match directly - it's from the same, better search endpoint
      // that already worked, rather than a separate single-result geocode
      // call that has been observed to fail on queries the suggestion
      // search handles fine.
      if (resolvedResults && resolvedResults.length > 0) {
        handleSelect(resolvedResults[0]);
        return;
      }

      if (onManualBlur) onManualBlur();
    }, 150);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", gridColumn: "1 / -1" }}>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
          if (onFocus) onFocus();
        }}
        style={style}
      />

      {isSearching && (
        <div style={hintStyle}>Searching addresses...</div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div style={dropdownStyle}>
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              // Use onMouseDown (fires before blur) so the click registers
              // before the textarea's blur handler closes the dropdown.
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
              style={suggestionItemStyle}
            >
              📍 {s.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const hintStyle = {
  fontSize: "12px",
  color: "#7a89b8",
  marginTop: "4px",
  marginBottom: "4px"
};

const dropdownStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 10,
  background: "#fff",
  border: "1px solid #d6dcf7",
  borderRadius: "12px",
  marginTop: "4px",
  boxShadow: "0 12px 28px rgba(39,24,126,0.15)",
  maxHeight: "220px",
  overflowY: "auto"
};

const suggestionItemStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "10px 14px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "13.5px",
  color: "#1d2f66",
  borderBottom: "1px solid #f0f2fa"
};
