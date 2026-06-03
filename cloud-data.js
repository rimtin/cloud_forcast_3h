const GEO_URLS = [
  "indian_met_zones.geojson",
  "./indian_met_zones.geojson",
  "assets/indian_met_zones.geojson"
];

const CLOUD_CATEGORIES = [
  "Clear Sky",
  "Low Cloud Coverage",
  "Medium Cloud Coverage",
  "High Cloud Coverage",
  "Overcast"
];

const CLOUD_COLORS = {
  "Clear Sky": "#66CCFF",
  "Low Cloud Coverage": "#028A0F",
  "Medium Cloud Coverage": "#FFF500",
  "High Cloud Coverage": "#FF8A00",
  "Overcast": "#FF0000",
  "No Forecast / Not Used": "#FFFFFF"
};

const CLOUD_TEXT_COLORS = {
  "Clear Sky": "#000000",
  "Low Cloud Coverage": "#FFFFFF",
  "Medium Cloud Coverage": "#000000",
  "High Cloud Coverage": "#000000",
  "Overcast": "#FFFFFF",
  "No Forecast / Not Used": "#000000"
};

const forecastData = [
  {
    state: "PB",
    fullState: "Punjab",
    areas: [
      {
        area: "Punjab",
        mapName: "Punjab",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  },

  {
    state: "RJ",
    fullState: "Rajasthan",
    areas: [
      {
        area: "West Rajasthan",
        mapName: "West Rajasthan",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      },
      {
        area: "East Rajasthan",
        mapName: "East Rajasthan",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  },

  {
    state: "GJ",
    fullState: "Gujarat",
    areas: [
      {
        area: "Saurashtra & Kutch",
        mapName: "Saurashtra & Kachchh",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      },
      {
        area: "Gujarat Region",
        mapName: "Gujarat Region",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  },

  {
    state: "UP",
    fullState: "Uttar Pradesh",
    areas: [
      {
        area: "West Uttar Pradesh",
        mapName: "West Uttar Pradesh",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      },
      {
        area: "East Uttar Pradesh",
        mapName: "East Uttar Pradesh",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  },

  {
    state: "MP",
    fullState: "Madhya Pradesh",
    areas: [
      {
        area: "West Madhya Pradesh",
        mapName: "West Madhya Pradesh",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      },
      {
        area: "East Madhya Pradesh",
        mapName: "East Madhya Pradesh",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  },

  {
    state: "CG",
    fullState: "Chhattisgarh",
    areas: [
      {
        area: "Chhattisgarh",
        mapName: "Chhattisgarh",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  },

  {
    state: "MH",
    fullState: "Maharashtra",
    areas: [
      {
        area: "Madhya Maharashtra",
        mapName: "Madhya Maharashtra",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      },
      {
        area: "Marathwada",
        mapName: "Marathwada",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      },
      {
        area: "Vidarbha",
        mapName: "Vidarbha",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  },

  {
    state: "TS",
    fullState: "Telangana",
    areas: [
      {
        area: "Telangana",
        mapName: "Telangana",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  },

  {
    state: "AP",
    fullState: "Andhra Pradesh",
    areas: [
      {
        area: "Andhra Pradesh",
        mapName: "Coastal Andhra Pradesh",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      },
      {
        area: "Rayalaseema",
        mapName: "Rayalaseema",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  },

  {
    state: "KA",
    fullState: "Karnataka",
    areas: [
      {
        area: "North Interior Karnataka",
        mapName: "North Interior Karnataka",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      },
      {
        area: "South Interior Karnataka",
        mapName: "South Interior Karnataka",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  },

  {
    state: "TN",
    fullState: "Tamil Nadu",
    areas: [
      {
        area: "Tamil Nadu",
        mapName: "Tamil Nadu, Puducherry & Karaikal",
        day1: "Clear Sky",
        day2: "Clear Sky",
        day3: "Clear Sky"
      }
    ]
  }
];
