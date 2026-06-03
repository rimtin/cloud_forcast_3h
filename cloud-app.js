document.addEventListener("DOMContentLoaded", () => {
  setAutomaticBulletinDate();
  createCloudTable();
});

function setAutomaticBulletinDate() {
  const forecastDateElement = document.getElementById("forecast-date");
  const issueTimeElement = document.getElementById("issue-time");

  const now = new Date();

  const issueDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);

  if (forecastDateElement) {
    forecastDateElement.textContent = `Forecast Date: ${issueDate}`;
  }

  if (issueTimeElement) {
    issueTimeElement.textContent = `Forecast Issued: ${issueDate}`;
  }
}

function createCloudTable() {
  const tableBody = document.getElementById("cloud-table-body");

  if (!tableBody) return;

  tableBody.innerHTML = "";

  cloudForecastData.forEach((stateBlock) => {
    stateBlock.areas.forEach((area, index) => {
      const row = document.createElement("tr");

      const snoCell = document.createElement("td");
      snoCell.textContent = area.sno;
      row.appendChild(snoCell);

      if (index === 0) {
        const stateCell = document.createElement("td");
        stateCell.textContent = stateBlock.state;
        stateCell.rowSpan = stateBlock.areas.length;
        stateCell.className = "state-cell";
        row.appendChild(stateCell);
      }

      const subdivisionCell = document.createElement("td");
      subdivisionCell.textContent = area.subdivision;
      row.appendChild(subdivisionCell);

      const day1Cell = document.createElement("td");
      const select = createCloudSelect(area.day1);
      day1Cell.appendChild(select);
      row.appendChild(day1Cell);

      tableBody.appendChild(row);
    });
  });
}

function createCloudSelect(selectedValue) {
  const select = document.createElement("select");
  select.className = "cloud-select";

  cloudCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;

    if (category === selectedValue) {
      option.selected = true;
    }

    select.appendChild(option);
  });

  applyCloudSelectColor(select);

  select.addEventListener("change", () => {
    applyCloudSelectColor(select);
  });

  return select;
}

function applyCloudSelectColor(select) {
  const value = select.value;
  const color = cloudColors[value] || "#ffffff";

  select.style.backgroundColor = color;

  if (value === "Low Cloud" || value === "High Cloud" || value === "Overcast") {
    select.style.color = "#ffffff";
  } else {
    select.style.color = "#000000";
  }
}

function downloadPDF() {
  const element = document.getElementById("pdf-area");

  const options = {
    margin: 0.2,
    filename: "3-Hourly-Cloud-Forecast-Bulletin.pdf",
    image: {
      type: "jpeg",
      quality: 0.98
    },
    html2canvas: {
      scale: 2,
      useCORS: true
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait"
    }
  };

  html2pdf().set(options).from(element).save();
}
