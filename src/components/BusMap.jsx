import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { divIcon, icon } from 'leaflet'
import './Map.css'
import busIcon from '../assets/bus-marker.svg'

// Component to automatically update map view when user location changes
const LocationUpdater = ({ center, zoom }) => {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])
  
  return null
}

const BusMap = ({ 
  userLocation, 
  buses, 
  selectedBus, 
  onBusSelect,
  nearbyRadius = 5 // in km
}) => {
  const [mapCenter, setMapCenter] = useState([22.5726, 88.3639]) // Default center (Kolkata)
  const [mapZoom, setMapZoom] = useState(12)
  
  // Update map center when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
      setMapZoom(13)
    }
  }, [userLocation])
  
  // Update map center when a bus is selected
  useEffect(() => {
    if (selectedBus && selectedBus.coordinates) {
      setMapCenter([selectedBus.coordinates.lat, selectedBus.coordinates.lng])
      setMapZoom(14)
    }
  }, [selectedBus])
  
  // Force center update when component mounts if a bus is already selected
  useEffect(() => {
    if (selectedBus && selectedBus.coordinates) {
      setMapCenter([selectedBus.coordinates.lat, selectedBus.coordinates.lng])
      setMapZoom(14)
    }
  }, [])
  
  // Create custom icon for buses
  const createBusIcon = (bus) => {
    // Use full bus number for display
    const busNumber = bus.routeNumber;
    
    return divIcon({
      className: '',
      html: `
        <div class="bus-icon-container ${selectedBus?.id === bus.id ? 'selected' : ''}">
          <img src="${busIcon}" class="bus-icon" alt="Bus" />
          <div class="bus-number">${busNumber}</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    })
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Dynamic location updater */}
        <LocationUpdater center={mapCenter} zoom={mapZoom} />
        
        {/* User location marker and radius */}
        {userLocation && (
          <>
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={divIcon({
                className: '',
                html: '<div class="user-marker"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>Your location</Popup>
            </Marker>
            
            <Circle 
              center={[userLocation.lat, userLocation.lng]}
              radius={nearbyRadius * 1000} // Convert km to meters
              className="user-radius"
            />
          </>
        )}
        
        {/* Bus markers */}
        {buses.map(bus => (
          <Marker 
            key={bus.id}
            position={[bus.coordinates.lat, bus.coordinates.lng]}
            icon={createBusIcon(bus)}
            eventHandlers={{
              click: () => onBusSelect(bus)
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{bus.routeNumber} - {bus.routeName}</p>
                <p>Current: {bus.currentLocation}</p>
                <p>Next: {bus.nextStop}</p>
                <p>ETA: {bus.estimatedArrival}</p>
                {userLocation && bus.distanceFromUser && (
                  <p className="text-primary-600 mt-1">{bus.distanceFromUser.toFixed(1)} km away</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default BusMap