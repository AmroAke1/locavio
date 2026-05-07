import L from 'leaflet'

const CATEGORY_COLORS = {
  food:     '#A0522D', // primary sienna
  culture:  '#3D2B1F', // espresso
  sport:    '#4A7C59', // success green
  social:   '#D4A373', // accent tan
  nature:   '#6B7F5E', // muted olive
  shopping: '#8B5E3C', // warm brown
}

const STATUS_COLORS = {
  upcoming:  '#A0522D', // primary sienna
  active:    '#4A7C59', // success green
  completed: '#8B7355', // muted
  wishlist:  '#D4A373', // accent tan
  draft:     '#3D2B1F', // espresso
}

export function createActivityPin(orderIndex, category = 'culture') {
  const color = CATEGORY_COLORS[category] ?? '#A0522D'
  return L.divIcon({
    html: `<div style="
      background-color:${color};
      color:white;
      width:28px;height:28px;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:13px;font-family:Inter,sans-serif;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    ">${orderIndex + 1}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

export function createStatusPin(status = 'draft') {
  const color = STATUS_COLORS[status] ?? '#8B7355'
  return L.divIcon({
    html: `<div style="
      width:26px;height:34px;
      display:flex;align-items:center;justify-content:center;
    ">
      <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21s13-11.25 13-21C26 5.82 20.18 0 13 0z"
          fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="13" cy="13" r="5" fill="white" opacity="0.9"/>
      </svg>
    </div>`,
    className: '',
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -36],
  })
}
