import L from 'leaflet'

const CATEGORY_COLORS = {
  food: '#F97316',
  culture: '#A855F7',
  sport: '#22C55E',
  social: '#3B82F6',
  nature: '#14B8A6',
  shopping: '#EC4899',
}

const STATUS_COLORS = {
  upcoming: '#3B82F6',
  active: '#22C55E',
  completed: '#9CA3AF',
  wishlist: '#EAB308',
  draft: '#8B7355',
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
      background-color:${color};
      width:20px;height:20px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  })
}
