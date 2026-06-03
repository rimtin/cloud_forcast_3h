document.addEventListener("DOMContentLoaded", () => {
  setAutomaticIssueDate();
  buildForecastTable();
  loadAllMaps();
});

function setAutomaticIssueDate() {
  const dateElement = document.getElementById("issue-date");
  const timeElement = document.getElementById("issue-clock");

  const now = new Date();

  const issueDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);

  const issueTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(now);

  if (dateElement) {
    dateElement.textContent = `Forecast Issued: ${issueDate}`;
  }

  if (timeElement) {
    timeElement.textContent = `Time: ${issueTime} IST`;
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

      row.appendChild(createForecastCell(area, stateBlock, "day1"));
      row.appendChild(createForecastCell(area, stateBlock, "day2"));
      row.appendChild(createForecastCell(area, stateBlock, "day3"));

      tableBody.appendChild(row);
    });
  });
}

function createForecastCell(area, stateBlock, dayKey) {
  const cell = document.createElement("td");

  const select = createForecastSelect(area[dayKey]);
  select.dataset.state = stateBlock.fullState;
  select.dataset.area = area.mapName;
  select.dataset.day = dayKey;

  cell.appendChild(select);
  return cell;
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
    window.cloudGeoData = geoData;

    setTimeout(() => {
      updateAllMaps();
    }, 500);
  } catch (error) {
    console.error("Map loading failed:", error);
  }
}

async function loadGeoJson() {
  for (const url of GEO_URLS) {
    try {
      const response = await fetch(url, {
        cache: "no-store"
      });

      if (response.ok) {
        console.log("GeoJSON loaded from:", url);
        return await response.json();
      }

      console.warn("GeoJSON failed:", url, response.status);
    } catch (error) {
      console.warn("Could not load GeoJSON from:", url, error);
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

function getForecastEntries(dayKey) {
  const entries = [];
  const selects = document.querySelectorAll(`.forecast-select[data-day="${dayKey}"]`);

  selects.forEach((select) => {
    const mainName = normalizeName(select.dataset.area);
    const names = [mainName];

    const aliases = MAP_NAME_ALIASES[mainName];

    if (aliases && Array.isArray(aliases)) {
      aliases.forEach((alias) => {
        names.push(normalizeName(alias));
      });
    }

    entries.push({
      names: [...new Set(names)],
      category: select.value
    });
  });

  return entries;
}

function getCategoryForFeature(featureName, entries) {
  const normalizedFeature = normalizeName(featureName);

  for (const entry of entries) {
    if (entry.names.includes(normalizedFeature)) {
      return entry.category;
    }
  }

  return null;
}

function drawMap(svgId, legendId, geoData, dayKey) {
  const svgElement = document.getElementById(svgId);
  if (!svgElement) return;

  const wrapper = svgElement.closest(".map-wrapper");

  const width = wrapper.clientWidth || 900;
  const height = wrapper.clientHeight || 405;

  const svg = d3.select(`#${svgId}`);
  svg.selectAll("*").remove();

  svg
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const features = getGeoFeatures(geoData);

  if (!features || features.length === 0) {
    console.error("No map features found in GeoJSON.");
    return;
  }

  console.log("Map features found:", features.length);
  console.log("Sample properties:", features[0].properties);

  const projection = d3.geoMercator().fitExtent(
    [
      [30, 20],
      [width - 180, height - 20]
    ],
    {
      type: "FeatureCollection",
      features: features
    }
  );

  const path = d3.geoPath().projection(projection);
  const entries = getForecastEntries(dayKey);

  createHatchPattern(svg, svgId);

  svg
    .append("g")
    .selectAll("path")
    .data(features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const featureName = getFeatureName(d);
      const category = getCategoryForFeature(featureName, entries);

      if (!category) {
        return `url(#hatch-${svgId})`;
      }

      return CLOUD_COLORS[category] || "#ffffff";
    })
    .attr("stroke", "#555555")
    .attr("stroke-width", 0.65);

  createLegend(legendId);
}

function createHatchPattern(svg, svgId) {
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
}

function getGeoFeatures(geoData) {
  if (geoData.type === "FeatureCollection") {
    return geoData.features;
  }

  if (geoData.type === "Topology") {
    const objectKeys = Object.keys(geoData.objects);

    let bestKey = objectKeys[0];
    let maxCount = 0;

    objectKeys.forEach((key) => {
      const obj = geoData.objects[key];

      if (obj && obj.geometries && obj.geometries.length > maxCount) {
        maxCount = obj.geometries.length;
        bestKey = key;
      }
    });

    console.log("Using TopoJSON object:", bestKey);

    return topojson.feature(geoData, geoData.objects[bestKey]).features;
  }

  return [];
}

function getFeatureName(feature) {
  const props = feature.properties || {};

  return (
    props.SUBDIVISION ||
    props.SUB_DIVISION ||
    props.Sub_Division ||
    props.subdivision ||
    props.SUBDIV ||
    props.SUBDIVISION_NAME ||
    props.MET_SUBDIV ||
    props.MET_SUB_DIV ||
    props.DISTRICT ||
    props.District ||
    props.district ||
    props.NAME ||
    props.Name ||
    props.name ||
    props.NAME_1 ||
    props.ST_NM ||
    props.STATE ||
    props.state ||
    props.ST_NAME ||
    ""
  );
}

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/,/g, "")
    .replace(/\./g, "")
    .replace(/-/g, " ")
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
  const button = document.getElementById("download-btn");

  if (button) {
    button.style.display = "none";
  }

  window.scrollTo(0, 0);

  setTimeout(() => {
    const options = {
      margin: [0.1, 0.1, 0.1, 0.1],
      filename: "Cloud_Forecast_Bulletin.pdf",

      image: {
        type: "jpeg",
        quality: 0.96
      },

      html2canvas: {
        scale: 1.8,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: element.scrollHeight
      },

      jsPDF: {
        unit: "px",
        format: [794, 1123],
        orientation: "portrait"
      },

      pagebreak: {
        mode: ["css", "legacy"],
        before: [".maps-section", ".weather-section"],
        avoid: ["table", "tr"]
      }
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        if (button) {
          button.style.display = "block";
        }
      });
  }, 600);
}
