document.addEventListener("DOMContentLoaded", () => {
  setAutomaticIssueDate();
  buildForecastTable();
  loadAllMaps();
});

function setAutomaticIssueDate() {
  const issueElement = document.getElementById("issue-time");

  const now = new Date();

  const issueDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);

  if (issueElement) {
    issueElement.textContent = `Forecast Issued: ${issueDate}`;
  }
}

function buildForecastTable() {
  const tableBody = document.getElementById("cloud-table-body");

  if (!tableBody) return;

  tableBody.innerHTML = "";

  forecastData.forEach((stateBlock) => {
    stateBlock.areas.forEach((area, index) => {
      const row = document.createElement("tr");

      if (index === 0) {
        const stateCell = document.createElement("td");
        stateCell.textContent = stateBlock.state;
        stateCell.rowSpan = stateBlock.areas.length;
        stateCell.className = "state-cell";
        row.appendChild(stateCell);
      }

      const areaCell = document.createElement("td");
      areaCell.textContent = area.area;
      areaCell.className = "area-cell";
      row.appendChild(areaCell);

      const day1Cell = document.createElement("td");
      const day1Select = createForecastSelect(area.day1);
      day1Select.dataset.state = stateBlock.fullState;
      day1Select.dataset.area = area.mapName;
      day1Select.dataset.day = "day1";
      day1Cell.appendChild(day1Select);
      row.appendChild(day1Cell);

      const day2Cell = document.createElement("td");
      const day2Select = createForecastSelect(area.day2);
      day2Select.dataset.state = stateBlock.fullState;
      day2Select.dataset.area = area.mapName;
      day2Select.dataset.day = "day2";
      day2Cell.appendChild(day2Select);
      row.appendChild(day2Cell);

      const day3Cell = document.createElement("td");
      const day3Select = createForecastSelect(area.day3);
      day3Select.dataset.state = stateBlock.fullState;
      day3Select.dataset.area = area.mapName;
      day3Select.dataset.day = "day3";
      day3Cell.appendChild(day3Select);
      row.appendChild(day3Cell);

      tableBody.appendChild(row);
    });
  });
}

function createForecastSelect(selectedValue) {
  const select = document.createElement("select");
  select.className = "forecast-select";

  CLOUD_CATEGORIES.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;

    if (category === selectedValue) {
      option.selected = true;
    }

    select.appendChild(option);
  });

  applySelectStyle(select);

  select.addEventListener("change", () => {
    applySelectStyle(select);
    updateAllMaps();
  });

  return select;
}

function applySelectStyle(select) {
  const value = select.value;

  select.style.backgroundColor = CLOUD_COLORS[value] || "#ffffff";
  select.style.color = CLOUD_TEXT_COLORS[value] || "#000000";
}

async function loadAllMaps() {
  try {
    const geoData = await loadGeoJson();

    drawMap("cloudMapDay1", "legendDay1", geoData, "day1");
    drawMap("cloudMapDay2", "legendDay2", geoData, "day2");
    drawMap("cloudMapDay3", "legendDay3", geoData, "day3");

    window.cloudGeoData = geoData;
  } catch (error) {
    console.error("Map loading failed:", error);
  }
}

async function loadGeoJson() {
  for (const url of GEO_URLS) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Could not load: ${url}`);
    }
  }

  throw new Error("No GeoJSON file found. Check indian_met_zones.geojson path.");
}

function updateAllMaps() {
  if (!window.cloudGeoData) return;

  drawMap("cloudMapDay1", "legendDay1", window.cloudGeoData, "day1");
  drawMap("cloudMapDay2", "legendDay2", window.cloudGeoData, "day2");
  drawMap("cloudMapDay3", "legendDay3", window.cloudGeoData, "day3");
}

function getCurrentForecastMap(dayKey) {
  const result = {};

  const selects = document.querySelectorAll(`.forecast-select[data-day="${dayKey}"]`);

  selects.forEach((select) => {
    const areaName = normalizeName(select.dataset.area);
    result[areaName] = select.value;
  });

  return result;
}

function drawMap(svgId, legendId, geoData, dayKey) {
  const svg = d3.select(`#${svgId}`);
  svg.selectAll("*").remove();

  const wrapper = document.getElementById(svgId).parentElement;
  const width = wrapper.clientWidth;
  const height = wrapper.clientHeight;

  svg.attr("viewBox", `0 0 ${width} ${height}`);

  const features = getGeoFeatures(geoData);

  const projection = d3.geoMercator().fitSize([width, height], {
    type: "FeatureCollection",
    features: features
  });

  const path = d3.geoPath().projection(projection);

  const forecastMap = getCurrentForecastMap(dayKey);

  const defs = svg.append("defs");

  const pattern = defs
    .append("pattern")
    .attr("id", `hatch-${svgId}`)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 8)
    .attr("height", 8)
    .attr("patternTransform", "rotate(-45)");

  pattern
    .append("rect")
    .attr("width", 8)
    .attr("height", 8)
    .attr("fill", "#ffffff");

  pattern
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 8)
    .attr("stroke", "#b8b8b8")
    .attr("stroke-width", 2);

  svg
    .append("g")
    .selectAll("path")
    .data(features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const name = getFeatureName(d);
      const category = forecastMap[normalizeName(name)];

      if (!category) {
        return `url(#hatch-${svgId})`;
      }

      return CLOUD_COLORS[category] || "#ffffff";
    })
    .attr("stroke", "#555555")
    .attr("stroke-width", 0.7);

  createLegend(legendId);
}

function getGeoFeatures(geoData) {
  if (geoData.type === "FeatureCollection") {
    return geoData.features;
  }

  if (geoData.type === "Topology") {
    const objectKey = Object.keys(geoData.objects)[0];
    return topojson.feature(geoData, geoData.objects[objectKey]).features;
  }

  return [];
}

function getFeatureName(feature) {
  const props = feature.properties || {};

  return (
    props.SUBDIVISION ||
    props.subdivision ||
    props.NAME_1 ||
    props.ST_NM ||
    props.state ||
    props.name ||
    props.Name ||
    ""
  );
}

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/,/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function createLegend(legendId) {
  const legend = document.getElementById(legendId);

  if (!legend) return;

  legend.innerHTML = "";

  CLOUD_CATEGORIES.forEach((category) => {
    const item = document.createElement("div");
    item.className = "legend-item";

    const colorBox = document.createElement("span");
    colorBox.className = "legend-color";
    colorBox.style.backgroundColor = CLOUD_COLORS[category];

    const label = document.createElement("span");
    label.textContent = category;

    item.appendChild(colorBox);
    item.appendChild(label);
    legend.appendChild(item);
  });

  const unusedItem = document.createElement("div");
  unusedItem.className = "legend-item";

  const hatchBox = document.createElement("span");
  hatchBox.className = "legend-hatch";

  const hatchLabel = document.createElement("span");
  hatchLabel.textContent = "No Forecast / Not Used";

  unusedItem.appendChild(hatchBox);
  unusedItem.appendChild(hatchLabel);
  legend.appendChild(unusedItem);
}

function downloadPDF() {
  const element = document.getElementById("pdf-area");

  const options = {
    margin: 0.2,
    filename: "Cloud_Forecast_Bulletin.pdf",
    image: {
      type: "jpeg",
      quality: 0.98
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait"
    }
  };

  html2pdf().set(options).from(element).save();
}
