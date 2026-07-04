import React from "react";

/**
 * Displays branch cards for pickup selection in a clean, simple interface.
 * - Shows all branches as selectable cards (none disabled)
 * - If a recommendation exists, shows a small message above the cards
 * - No distances, no status badges, no complex UI
 * - User's manual selection always has highest priority
 */
export default function BranchSelector({
  rankedBranches = [],
  recommendedBranchId,
  selectedBranchId,
  onSelectBranch
}) {
  if (!rankedBranches.length) return null;

  return (
    <div style={wrapperStyle}>
      <div style={labelStyle}>Pickup Branch</div>

      {recommendedBranchId && (
        <div style={recommendationMessageStyle}>
          ⭐ Recommended Branch:{" "}
          <strong>
            {
              rankedBranches.find((b) => b.id === recommendedBranchId)
                ?.shortName ||
              rankedBranches.find((b) => b.id === recommendedBranchId)?.name
            }
          </strong>
        </div>
      )}

      <div style={branchGridStyle}>
        {rankedBranches.map((branch) => {
          const isSelected = branch.id === selectedBranchId;

          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => onSelectBranch(branch.id)}
              style={{
                ...branchCardStyle,
                borderColor: isSelected ? "#27187E" : "#e3e7f5",
                background: isSelected ? "#eef1ff" : "#fff"
              }}
            >
              <span
                style={{
                  ...radioDotStyle,
                  borderColor: isSelected ? "#27187E" : "#c6cee8",
                  background: isSelected ? "#27187E" : "transparent"
                }}
              />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={branchNameStyle}>{branch.shortName || branch.name}</div>
                <div style={branchAddressStyle}>{branch.address.full}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const wrapperStyle = {
  gridColumn: "1 / -1",
  marginTop: "6px",
  marginBottom: "6px"
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#27187E",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.4px"
};

const recommendationMessageStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#27187E",
  marginBottom: "12px",
  paddingBottom: "8px",
  borderBottom: "1px solid #e3e7f5"
};

const branchGridStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const branchCardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1.5px solid #e3e7f5",
  background: "#fff",
  cursor: "pointer",
  transition: "all 0.2s ease",
  textAlign: "left",
  width: "100%"
};

const branchNameStyle = {
  fontWeight: "700",
  fontSize: "15px",
  color: "#1d2f66"
};

const branchAddressStyle = {
  fontSize: "13px",
  color: "#5a6b96",
  marginTop: "3px",
  lineHeight: "1.4"
};

const radioDotStyle = {
  marginTop: "4px",
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  border: "2px solid #c6cee8",
  flexShrink: 0,
  boxSizing: "border-box"
};
