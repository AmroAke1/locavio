import { useState } from 'react'

export function useMap() {
  const [centerCoords, setCenterCoords] = useState([20, 0])
  const [zoom, setZoomLevel] = useState(13)

  const setCenter = (lat, lng) => {
    setCenterCoords([lat, lng])
  }

  return { centerCoords, zoom, setCenter, setZoomLevel }
}
