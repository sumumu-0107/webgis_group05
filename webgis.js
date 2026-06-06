// ===============================
// Greece Air Quality WebGIS
// Group 05
// ===============================

// Final online GeoServer WMS URL.
// After all layers are published online, this URL should be used.
const wmsUrl = "https://www.gis-geoserver.polimi.it/geoserver/wms";

// If you want to test with your local GeoServer inside the VM,
// you can temporarily replace the line above with:
// const wmsUrl = "http://localhost:8082/geoserver/wms";


const map = L.map("map", {
  center: [39.1, 22.5],
  zoom: 6
});

// Base map
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Blank base map, useful when WMS layers have their own visual style
const blankBase = L.tileLayer("", {
  attribution: "Blank base map"
});

// Helper function for GeoServer WMS layers
function createWMSLayer(layerName, opacity = 0.75) {
  return L.tileLayer.wms(wmsUrl, {
    layers: layerName,
    format: "image/png",
    transparent: true,
    version: "1.1.0",
    opacity: opacity,
    attribution: "GeoServer WMS"
  });
}

// ===============================
// NO2 layers
// These layer names should match the online GeoServer workspace.
// If your final online workspace is gisgeoserver_05, keep this prefix.
// ===============================

const no2December = createWMSLayer(
  "gisgeoserver_05:Greece_CAMS_no2_2023_12",
  0.80
);

const no2Average = createWMSLayer(
  "gisgeoserver_05:Greece_average_no2_2023",
  0.80
);

const no2Class = createWMSLayer(
  "gisgeoserver_05:Greece_no2_concentration_map_2023",
  0.85
);

const no2Amac = createWMSLayer(
  "gisgeoserver_05:Greece_no2_2021_2023_AMAC_map",
  0.85
);

const builtAreaChange = createWMSLayer(
  "gisgeoserver_05:Greece_built_area_mask_2021_2023_4326",
  0.90
);

const landCoverChange = createWMSLayer(
  "gisgeoserver_05:Greece_LCC_2021_2023_4326",
  0.75
);

const no2Bivariate = createWMSLayer(
  "gisgeoserver_05:Greece_no2_2023_bivariate",
  0.85
);

// PM2.5 layers
const pm25December = createWMSLayer(
  "gisgeoserver_05:Greece_CAMS_pm2p5_2023_12",
  0.80
);

const pm25Average = createWMSLayer(
  "gisgeoserver_05:Greece_average_pm2p5_2023",
  0.80
);

const pm25Class = createWMSLayer(
  "gisgeoserver_05:Greece_pm2p5_concentration_map_2023",
  0.85
);

const pm25Amac = createWMSLayer(
  "gisgeoserver_05:Greece_pm2p5_2021_2023_AMAC_map",
  0.85
);

const pm25Bivariate = createWMSLayer(
  "gisgeoserver_05:Greece_pm2p5_2023_bivariate",
  0.85
);

// Default visible layer.
// It will display after the online GeoServer layer is published.
no2Average.addTo(map);

// Base layer control
const baseMaps = {
  "OpenStreetMap": osm,
  "Blank background": blankBase
};

// Overlay layer control
const overlayMaps = {
  "NO₂ December 2023": no2December,
  "NO₂ Annual Average 2023": no2Average,
  "NO₂ Concentration Classes 2023": no2Class,
  "NO₂ AMAC 2021–2023": no2Amac,
  "Built Area Change 2021–2023": builtAreaChange,
  "Land Cover Change 2021–2023": landCoverChange,
  "NO₂–Population Bivariate 2023": no2Bivariate,
  "PM2.5 December 2023": pm25December,
  "PM2.5 Annual Average 2023": pm25Average,
  "PM2.5 Concentration Classes 2023": pm25Class,
  "PM2.5 AMAC 2021–2023": pm25Amac,
  "PM2.5–Population Bivariate 2023": pm25Bivariate
};

// Track active pollutant type for layer filtering
let activePollutant = "NO2"; // "NO2" or "PM25"

// Render layer control manually to the panel below the map
function renderLayerControl() {
  const container = document.getElementById("layer-control-container");
  if (!container) return;

  let html = "";
  
  // Pollutant selector tabs
  html += `
    <div style="margin-bottom:16px; display:flex; gap:8px; border-bottom:2px solid #edf1ef; padding-bottom:8px;">
      <button class="pollutant-tab ${activePollutant === "NO2" ? "active" : ""}" data-pollutant="NO2" 
        style="padding:6px 12px; border:none; background:${activePollutant === "NO2" ? "#1d5c63" : "#f0f2f1"}; color:${activePollutant === "NO2" ? "#fff" : "#263238"}; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px;">
        NO₂
      </button>
      <button class="pollutant-tab ${activePollutant === "PM25" ? "active" : ""}" data-pollutant="PM25" 
        style="padding:6px 12px; border:none; background:${activePollutant === "PM25" ? "#1d5c63" : "#f0f2f1"}; color:${activePollutant === "PM25" ? "#fff" : "#263238"}; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px;">
        PM2.5
      </button>
    </div>
  `;
  
  // Base layers (radio buttons)
  html += "<fieldset style='border:none; padding:0; margin-bottom:12px'><legend style='font-size:12px;font-weight:700;color:#1d5c63;margin-bottom:6px'>Base Layers</legend>";
  for (const [name, layer] of Object.entries(baseMaps)) {
    const isActive = map.hasLayer(layer);
    html += `
      <label>
        <input type="radio" name="base" value="${name}" ${isActive ? "checked" : ""} class="base-radio">
        ${name}
      </label>
    `;
  }
  html += "</fieldset>";
  
  // Overlay layers (checkboxes) - filtered by pollutant
  html += "<fieldset style='border:none; padding:0'><legend style='font-size:12px;font-weight:700;color:#1d5c63;margin-bottom:6px'>Overlay Layers</legend>";
  for (const [name, layer] of Object.entries(overlayMaps)) {
    // Filter by pollutant
    const isNO2Layer = name.includes("NO₂") || name.includes("NO2") || name.includes("Built") || name.includes("Land Cover");
    const isPM25Layer = name.includes("PM2.5");
    const otherLayer = !isNO2Layer && !isPM25Layer;
    
    // Show layer if it matches active pollutant or is an "other" layer
    if ((activePollutant === "NO2" && (isNO2Layer || otherLayer)) || 
        (activePollutant === "PM25" && (isPM25Layer || otherLayer))) {
      const isActive = map.hasLayer(layer);
      html += `
        <label>
          <input type="checkbox" value="${name}" ${isActive ? "checked" : ""} class="overlay-checkbox">
          ${name}
        </label>
      `;
    }
  }
  html += "</fieldset>";
  
  container.innerHTML = html;
  
  // Add event listeners for pollutant tabs
  container.querySelectorAll(".pollutant-tab").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      activePollutant = e.target.dataset.pollutant;
      renderLayerControl(); // Re-render to show/hide layers
    });
  });
  
  // Add event listeners for base layers
  container.querySelectorAll(".base-radio").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const layerName = e.target.value;
      for (const [name, layer] of Object.entries(baseMaps)) {
        if (name === layerName) {
          map.addLayer(layer);
        } else {
          map.removeLayer(layer);
        }
      }
    });
  });
  
  // Add event listeners for overlay layers
  container.querySelectorAll(".overlay-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const layerName = e.target.value;
      const layer = overlayMaps[layerName];
      if (e.target.checked) {
        map.addLayer(layer);
      } else {
        map.removeLayer(layer);
      }
      updateLegend();
    });
  });
}

renderLayerControl();

// GeoServer WMS legend URL
function getWMSLegend(layerName) {
  return (
    wmsUrl +
    "?REQUEST=GetLegendGraphic" +
    "&VERSION=1.0.0" +
    "&FORMAT=image/png" +
    "&WIDTH=20" +
    "&HEIGHT=20" +
    "&LAYER=" +
    encodeURIComponent(layerName)
  );
}

// Legend list
const legendItems = [
  {
    layer: no2December,
    title: "NO₂ December 2023",
    type: "wms",
    layerName: "gisgeoserver_05:Greece_CAMS_no2_2023_12"
  },
  {
    layer: no2Average,
    title: "NO₂ Annual Average 2023",
    type: "wms",
    layerName: "gisgeoserver_05:Greece_average_no2_2023"
  },
  {
  layer: no2Class,
  title: "NO₂ Concentration Classes 2023",
  type: "wms",
  layerName: "gisgeoserver_05:Greece_no2_concentration_map_2023"
},
  {
    layer: no2Amac,
    title: "NO₂ AMAC 2021–2023",
    type: "wms",
    layerName: "gisgeoserver_05:Greece_no2_2021_2023_AMAC_map"
  },
  {
    layer: builtAreaChange,
    title: "Built Area Change 2021–2023",
    type: "wms",
    layerName: "gisgeoserver_05:Greece_built_area_mask_2021_2023_4326"
  },
  {
    layer: landCoverChange,
    title: "Land Cover Change 2021–2023",
    type: "wms",
    layerName: "gisgeoserver_05:Greece_LCC_2021_2023_4326"
  },
  {
    layer: pm25December,
    title: "PM2.5 December 2023",
    type: "wms",
    layerName: "gisgeoserver_05:Greece_CAMS_pm2p5_2023_12"
  },
  {
    layer: pm25Average,
    title: "PM2.5 Annual Average 2023",
    type: "wms",
    layerName: "gisgeoserver_05:Greece_average_pm2p5_2023"
  },
  {
    layer: pm25Class,
    title: "PM2.5 Concentration Classes 2023",
    type: "wms",
    layerName: "gisgeoserver_05:Greece_pm2p5_concentration_map_2023"
  },
  {
    layer: pm25Amac,
    title: "PM2.5 AMAC 2021–2023",
    type: "wms",
    layerName: "gisgeoserver_05:Greece_pm2p5_2021_2023_AMAC_map"
  },
  {
    layer: no2Bivariate,
    title: "NO₂–Population Bivariate 2023",
    type: "image",
    image: "img/NO2/legend_bivariate_5x5.png"
  },
  {
    layer: pm25Bivariate,
    title: "PM2.5–Population Bivariate 2023",
    type: "image",
    image: "img/NO2/legend_bivariate_5x5.png"
  }
];

function updateLegend() {
  const legendDiv = document.getElementById("legend-container");
  if (!legendDiv) return;

  let html = "";
  let hasLayer = false;

  legendItems.forEach((item) => {
    if (map.hasLayer(item.layer)) {
      hasLayer = true;
      html += `<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #edf1ef"><strong style="display:block;margin-bottom:6px;font-size:13px;color:#1d5c63">${item.title}</strong>`;

      if (item.type === "wms") {
        html += `
          <img 
            class="legend-img"
            src="${getWMSLegend(item.layerName)}" 
            alt="${item.title} legend"
            style="max-width:100%; width:auto; height:auto; display:block;"
          >
        `;
      }

      if (item.type === "image") {
        html += `
          <img 
            class="legend-img bivariate-legend-img"
            src="${item.image}" 
            alt="${item.title} legend"
            style="width:100%; max-width:100%; height:auto; display:block;"
          >
        `;
      }

      html += `</div>`;
    }
  });

  if (!hasLayer) {
    html += "<p style='color:#7a8789;font-size:13px'>Select a layer to show legend.</p>";
  }

  legendDiv.innerHTML = html;
}

map.on("overlayadd", updateLegend);
map.on("overlayremove", updateLegend);
map.on("baselayerchange", updateLegend);

updateLegend();
  
