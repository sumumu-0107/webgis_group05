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
// 注意：localhost 只适用于打开网页的同一台机器。
// 如果你在 Windows 主电脑打开网页，而 GeoServer 在虚拟机里，localhost 不一定能用。

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
  "NO₂–Population Bivariate 2023": no2Bivariate
};

// Add layer control
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);

// Add scale bar
L.control.scale({
  metric: true,
  imperial: false
}).addTo(map);

// Add a simple map note
const mapNote = L.control({ position: "bottomleft" });

mapNote.onAdd = function () {
  const div = L.DomUtil.create("div", "map-note");
  div.innerHTML = `
    <strong>Group 05 WebGIS</strong><br>
    Turn WMS layers on/off using the layer control.<br>
    WMS URL: ${wmsUrl}
    // ===============================
// Dynamic legend control
// ===============================

const legendControl = L.control({ position: "bottomright" });

legendControl.onAdd = function () {
  const div = L.DomUtil.create("div", "legend-control");
  div.innerHTML = "<h4>Legend</h4><p>Select a layer to show legend.</p>";
  return div;
};

legendControl.addTo(map);

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
    layer: no2Bivariate,
    title: "NO₂–Population Bivariate 2023",
    type: "image",
    image: "img/NO2/legend_bivariate_5x5.png"
  }
];

function updateLegend() {
  const legendDiv = document.querySelector(".legend-control");
  if (!legendDiv) return;

  let html = "<h4>Legend</h4>";
  let hasLayer = false;

  legendItems.forEach((item) => {
    if (map.hasLayer(item.layer)) {
      hasLayer = true;
      html += `<div class="legend-item"><strong>${item.title}</strong>`;

      if (item.type === "wms") {
        html += `<img src="${getWMSLegend(item.layerName)}" alt="${item.title} legend">`;
      }

      if (item.type === "image") {
        html += `<img src="${item.image}" alt="${item.title} legend">`;
      }

      html += `</div>`;
    }
  });

  if (!hasLayer) {
    html += "<p>Select a layer to show legend.</p>";
  }

  legendDiv.innerHTML = html;
}

map.on("overlayadd", updateLegend);
map.on("overlayremove", updateLegend);

updateLegend();
  `;
  return div;
};

mapNote.addTo(map);
