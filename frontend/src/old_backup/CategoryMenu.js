import React from "react";

function CategoryMenu({
  categories = [],
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
}) {
  const normalize = (str) => (str || "").toLowerCase().replace(/\s+/g, "");

  const selectedCategoryObj = categories.find(
    (cat) => normalize(cat.name) === normalize(selectedCategory)
  );

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "auto",
        fontFamily: "Arial, sans-serif",
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 16 }}>Shop by Category</h2>

      {/* Category buttons */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "flex-start",
          marginBottom: 20,
        }}
      >
        {categories.map((cat) => {
          const isSelected = normalize(cat.name) === normalize(selectedCategory);
          return (
            <button
              key={cat.name}
              style={{
                padding: "8px 16px",
                borderRadius: 24,
                cursor: "pointer",
                border: "none",
                backgroundColor: isSelected ? "#0d6efd" : "#e7f1ff",
                color: isSelected ? "#fff" : "#0d6efd",
                fontWeight: isSelected ? "600" : "500",
                boxShadow: isSelected
                  ? "0 4px 12px rgba(13, 110, 253, 0.4)"
                  : "none",
                transition: "all 0.3s ease",
              }}
              onClick={() => {
                setSelectedCategory(cat.name);
                setSelectedSubcategory(null);
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = "#cce0ff";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = "#e7f1ff";
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Show selected subcategory label instead of back button */}
      {selectedSubcategory && (
        <div
          style={{
            fontWeight: "600",
            fontSize: 16,
            color: "#0d6efd",
            marginBottom: 12,
            userSelect: "none",
          }}
        >
          Subcategory: {selectedSubcategory}
        </div>
      )}

      {/* Subcategory buttons */}
      {selectedCategory && selectedCategoryObj?.subcategories && (
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "flex-start",
            marginBottom: 20,
          }}
        >
          {selectedCategoryObj.subcategories.map((subcat) => {
            const isSubSelected = normalize(subcat) === normalize(selectedSubcategory);
            return (
              <button
                key={subcat}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: "none",
                  backgroundColor: isSubSelected ? "#198754" : "#d1e7dd",
                  color: isSubSelected ? "#fff" : "#0f5132",
                  fontWeight: isSubSelected ? "600" : "500",
                  boxShadow: isSubSelected
                    ? "0 4px 12px rgba(25, 135, 84, 0.4)"
                    : "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => setSelectedSubcategory(subcat)}
                onMouseEnter={(e) => {
                  if (!isSubSelected) e.currentTarget.style.backgroundColor = "#bcd6c7";
                }}
                onMouseLeave={(e) => {
                  if (!isSubSelected) e.currentTarget.style.backgroundColor = "#d1e7dd";
                }}
              >
                {subcat}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoryMenu;
