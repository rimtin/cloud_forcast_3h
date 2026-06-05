const CLOUD_GEO_URLS = [
  "indian_met_zones.geojson",
  "./indian_met_zones.geojson",
  "assets/indian_met_zones.geojson",
  "./assets/indian_met_zones.geojson",
  "https://rimtin.github.io/cloud_forcast_3h/indian_met_zones.geojson",
  "https://raw.githubusercontent.com/rimtin/cloud_forcast_3h/main/indian_met_zones.geojson",
  "https://cdn.jsdelivr.net/gh/rimtin/cloud_forcast_3h@main/indian_met_zones.geojson",
  "https://rimtin.github.io/wind_bulletin/indian_met_zones.geojson",
  "https://raw.githubusercontent.com/rimtin/wind_bulletin/main/indian_met_zones.geojson",
  "https://cdn.jsdelivr.net/gh/rimtin/wind_bulletin@main/indian_met_zones.geojson"
];

let cachedCloudGeoJSON = null;

async function loadCloudGeoJSON() {
  if (cachedCloudGeoJSON) return cachedCloudGeoJSON;

  for (const url of CLOUD_GEO_URLS) {
    try {
      console.log("Trying Cloud GeoJSON:", url);

      const data = await d3.json(url);

      if (data && data.features && data.features.length > 0) {
        console.log("Cloud GeoJSON loaded from:", url);
        cachedCloudGeoJSON = data;
        return data;
      }
    } catch (error) {
      console.warn("Cloud GeoJSON failed:", url, error);
    }
  }

  throw new Error("No Cloud GeoJSON source could be loaded.");
}

function createCloudDropdown(selectedValue = "Clear Sky") {
  return `
    <select onchange="updateCloudMapColors(); applyCloudDropdownColor(this)">
      ${CLOUD_CATEGORIES.map(option => `
        <option value="${option}" ${option === selectedValue ? "selected" : ""}>
          ${option}
        </option>
      `).join("")}
    </select>
  `;
}

function buildCloudTable() {
  const tbody = document.getElementById("cloud-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  forecastData.forEach(item => {
    item.areas.forEach((area, index) => {
      const tr = document.createElement("tr");

      tr.setAttribute("data-area", area.area);
      tr.setAttribute("data-map-name", area.mapName || area.area);

      const stateCell = index === 0
        ? `<td rowspan="${item.areas.length}" class="state-cell">${item.state}</td>`
        : "";

      tr.innerHTML = `
        ${stateCell}
        <td class="area-cell">${area.area}</td>
        <td>${createCloudDropdown(area.day1)}</td>
        <td>${createCloudDropdown(area.day2)}</td>
        <td>${createCloudDropdown(area.day3)}</td>
      `;

      tbody.appendChild(tr);
    });
  });

  document.querySelectorAll("#cloud-table-body select")
    .forEach(select => applyCloudDropdownColor(select));
}

function applyCloudDropdownColor(select) {
  const color = CLOUD_COLORS[select.value] || "#ffffff";

  select.style.backgroundColor = color;
  select.style.fontWeight = "900";

  if (
    select.value === "Low Cloud Coverage" ||
    select.value === "Overcast"
  ) {
    select.style.color = "#ffffff";
  } else {
    select.style.color = "#000000";
  }
}

const cloudGeoNameMap = {
  "Punjab": "Punjab",

  "West Rajasthan": "West Rajasthan",
  "East Rajasthan": "East Rajasthan",

  "Saurashtra & Kutch": "Saurashtra & Kachh",
  "Saurashtra & Kachh": "Saurashtra & Kachh",
  "Gujarat Region": "Gujarat region",

  "West Uttar Pradesh": "West Uttar Pradesh",
  "East Uttar Pradesh": "East Uttar Pradesh",

  "West Madhya Pradesh": "West Madhya Pradesh",
  "East Madhya Pradesh": "East Madhya Pradesh",

  "Chhattisgarh": "Chhattisgarh",

  "Madhya Maharashtra": "Madhya Maharashtra",
  "Marathwada": "Marathwada",
  "Vidarbha": "Vidarbha",

  "Telangana": "Telangana",

  "Andhra Pradesh": "Coastal Andhra Pradesh",
  "Coastal Andhra Pradesh": "Coastal Andhra Pradesh",
  "Rayalaseema": "Rayalaseema",

  "North Interior Karnataka": "N.I. Karnataka",
  "South Interior Karnataka": "S.I. Karnataka",
  "N.I. Karnataka": "N.I. Karnataka",
  "S.I. Karnataka": "S.I. Karnataka",

  "Tamil Nadu": "Tamil Nadu & Puducherry",
  "Tamil Nadu & Puducherry": "Tamil Nadu & Puducherry"
};

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\./g, "")
    .replace(/kachh/g, "kutch")
    .replace(/kachchh/g, "kutch")
    .replace(/\s+/g, " ")
    .trim();
}

function getGeoNameFromFeature(d) {
  return (
    d.properties?.ST_NM ||
    d.properties?.st_nm ||
    d.properties?.ST_NAME ||
    d.properties?.SUBDIVISION ||
    d.properties?.subdivision ||
    d.properties?.SUBDIV_NAME ||
    d.properties?.subdiv_name ||
    d.properties?.SUB_DIVISION ||
    d.properties?.SUBDIV ||
    d.properties?.NAME ||
    d.properties?.name ||
    d.properties?.Name ||
    ""
  );
}

function getSubdivisionColor(geoName, dayNumber) {
  const rows = document.querySelectorAll("#cloud-table-body tr");
  const target = normalizeName(geoName);

  for (const row of rows) {
    const area = row.getAttribute("data-area");
    const mapName = row.getAttribute("data-map-name");

    const mappedGeoName =
      cloudGeoNameMap[mapName] ||
      cloudGeoNameMap[area] ||
      mapName ||
      area;

    if (normalizeName(mappedGeoName) === target) {
      const select = row.querySelectorAll("select")[dayNumber - 1];
      const selected = select?.value;

      if (selected === "No Forecast / Not Used") {
        return null;
      }

      return CLOUD_COLORS[selected] || null;
    }
  }

  return null;
}

function addNoForecastPattern(svg, patternId) {
  const defs = svg.append("defs");

  const pattern = defs.append("pattern")
    .attr("id", patternId)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 10)
    .attr("height", 10)
    .attr("patternTransform", "rotate(45)");

  pattern.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "#ffffff");

  pattern.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 10)
    .attr("stroke", "#777777")
    .attr("stroke-width", 1.3);
}

async function drawCloudMap(svgId, dayNumber) {
  const svg = d3.select(svgId);
  svg.selectAll("*").remove();

  const width = 900;
  const height = 430;
  const patternId = `noForecastPatternCloudDay${dayNumber}`;

  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  addNoForecastPattern(svg, patternId);

  try {
    const data = await loadCloudGeoJSON();

    const projection = d3.geoIdentity()
      .reflectY(true)
      .fitExtent(
        [
          [90, 20],
          [width - 210, height - 25]
        ],
        data
      );

    const path = d3.geoPath().projection(projection);

    svg.selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("class", "cloud-map-region")
      .attr("d", path)
      .attr("fill", `url(#${patternId})`)
      .attr("stroke", "#333333")
      .attr("stroke-width", 0.65)
      .attr("data-geo-name", d => getGeoNameFromFeature(d));

    updateCloudMapColors();

  } catch (error) {
    console.error("Final cloud map loading error:", error);

    svg.append("text")
      .attr("x", 20)
      .attr("y", 40)
      .attr("fill", "red")
      .attr("font-size", 14)
      .text("Map could not load. Check GeoJSON file path.");
  }
}

function updateCloudMapColors() {
  updateSingleCloudMap("#cloudMapDay1", 1);
  updateSingleCloudMap("#cloudMapDay2", 2);
  updateSingleCloudMap("#cloudMapDay3", 3);
}

function updateSingleCloudMap(svgId, dayNumber) {
  d3.selectAll(`${svgId} path`).attr("fill", function(d) {
    const color = getSubdivisionColor(getGeoNameFromFeature(d), dayNumber);
    return color || `url(#noForecastPatternCloudDay${dayNumber})`;
  });
}

function buildLegend() {
  const finalCategories = [...CLOUD_CATEGORIES];

  if (!finalCategories.includes("No Forecast / Not Used")) {
    finalCategories.push("No Forecast / Not Used");
  }

  const labelMap = {
    "No Forecast / Not Used": "No Forecast Available"
  };

  const legendHTML = `
    ${finalCategories.map(option => {
      const isNoForecast = option === "No Forecast / Not Used";
      const label = labelMap[option] || option;

      return `
        <div class="legend-item">
          <span class="legend-box ${isNoForecast ? "no-forecast-box" : ""}"
                style="${!isNoForecast ? `background:${CLOUD_COLORS[option] || "#ffffff"}` : ""}">
          </span>
          ${label}
        </div>
      `;
    }).join("")}
  `;

  ["legendDay1", "legendDay2", "legendDay3"].forEach(id => {
    const legend = document.getElementById(id);
    if (legend) legend.innerHTML = legendHTML;
  });
}

function downloadPDF() {
  const element = document.getElementById("pdf-area");

  const opt = {
    margin: 0.2,
    filename: "Cloud_Forecast_Bulletin.pdf",
    image: {
      type: "jpeg",
      quality: 0.98
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 980
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait",
      compress: true
    },
    pagebreak: {
      mode: ["css", "legacy"],
      before: [".maps-section", ".weather-section"],
      avoid: [".map-block", ".map-wrapper", "tr"]
    }
  };

  html2pdf().set(opt).from(element).save();
}

window.onload = function() {
  buildCloudTable();
  buildLegend();

  drawCloudMap("#cloudMapDay1", 1);
  drawCloudMap("#cloudMapDay2", 2);
  drawCloudMap("#cloudMapDay3", 3);
};
