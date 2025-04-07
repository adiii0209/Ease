import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Users, CreditCard, Wallet, DollarSign, ChevronLeft, Bus, MapPin, Clock } from 'lucide-react'
import busData from '../../buses.js'

const TicketBooking = () => {
  // Add smooth transitions for form elements
  const formTransitionClass = 'transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:scale-[1.02]'
  const [selectedBus, setSelectedBus] = useState('')
  const [selectedPickup, setSelectedPickup] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [selectedTiming, setSelectedTiming] = useState('')
  const [passengerCount, setPassengerCount] = useState(1)
  const [availableBuses, setAvailableBuses] = useState([])
  const [availableStops, setAvailableStops] = useState([])
  const [availableTimings, setAvailableTimings] = useState([])
  
  // New state variables for fare calculation and payment
  const [showFareDetails, setShowFareDetails] = useState(false)
  const [calculatedFare, setCalculatedFare] = useState(0)
  const [totalFare, setTotalFare] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Get URL parameters
  const location = useLocation()
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  // Load available buses on component mount and check for URL parameters
  useEffect(() => {
    setAvailableBuses(busData)
    
    // Get parameters from URL
    const params = new URLSearchParams(location.search)
    const busId = params.get('busId')
    
    if (busId) {
      // Automatically select the bus if it exists
      const busExists = busData.some(bus => bus.busId === busId)
      if (busExists) {
        setSelectedBus(busId)
      }
    }
  }, [location.search])

  // Update available stops when bus is selected
  useEffect(() => {
    if (selectedBus) {
      const bus = busData.find(b => b.busId === selectedBus)
      if (bus) {
        setAvailableStops(bus.stops)
        setAvailableTimings(bus.timings)
        
        // Reset selection fields when bus changes
        setSelectedPickup('')
        setSelectedDestination('')        
        setSelectedTiming('')
      }
    }
  }, [selectedBus])
  
  // Reset destination when pickup is selected, but only if destination is invalid
  useEffect(() => {
    if (selectedPickup && selectedDestination) {
      // Check if the destination comes after the pickup in the route
      const bus = busData.find(b => b.busId === selectedBus)
      if (bus) {
        const pickupIndex = bus.stops.indexOf(selectedPickup)
        const destinationIndex = bus.stops.indexOf(selectedDestination)
        
        // If destination comes before pickup or is the same stop, reset it
        if (destinationIndex <= pickupIndex) {
          setSelectedDestination('')
          setShowFareDetails(false)
        }
      }
    } else if (selectedPickup) {
      setShowFareDetails(false)
    }
  }, [selectedPickup, selectedDestination, selectedBus])
  
  // Calculate fare when all required fields are filled
  useEffect(() => {
    if (selectedBus && selectedPickup && selectedDestination) {
      calculateFare()
    }
  }, [selectedBus, selectedPickup, selectedDestination, passengerCount])
  
  // Function to calculate fare based on distance and passenger count
  const calculateFare = () => {
    const bus = busData.find(b => b.busId === selectedBus)
    if (!bus) return
    
    const pickupIndex = bus.stops.indexOf(selectedPickup)
    const destinationIndex = bus.stops.indexOf(selectedDestination)
    
    if (pickupIndex === -1 || destinationIndex === -1) return
    
    // Calculate distance (number of stops between pickup and destination)
    const stopsCount = destinationIndex - pickupIndex
    
    // Base fare calculation
    let baseFare = 0
    
    // Different fare calculation based on bus type
    if (selectedBus.startsWith('AC')) {
      // AC buses have higher fare
      baseFare = 20 + (stopsCount * 5)
    } else {
      // Regular buses
      baseFare = 10 + (stopsCount * 3)
    }
    
    setCalculatedFare(baseFare)
    setTotalFare(baseFare * passengerCount)
  }
  
  // Handle form submission
  const handleContinueBooking = (e) => {
    e.preventDefault()
    setShowFareDetails(true)
  }
  
  // Handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method)
  }
  
  // Process payment
  const processPayment = (e) => {
    e.preventDefault()
    setPaymentProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false)
      setPaymentSuccess(true)
    }, 2000)
  }
  
  // Go back to booking form
  const goBackToBooking = () => {
    setShowFareDetails(false)
    setSelectedPaymentMethod('')
    setPaymentSuccess(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 page-transition">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ticket Booking</h1>
        <p className="mt-2 text-base text-gray-600">
          Book your bus tickets in a few simple steps
        </p>
      </div>

      <div className="card p-6 bg-white shadow-lg rounded-xl">
        {!showFareDetails ? (
          <form className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md">
              {/* Bus Selection */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Bus className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500 transition-colors ${formTransitionClass}"
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                >
                  <option value="">Select a bus</option>
                  {availableBuses.map((bus) => (
                    <option key={bus.busId} value={bus.busId}>
                      {bus.busId} - {bus.route}
                    </option>
                  ))}
                </select>
              </div>

              {/* Journey Details - Only show when bus is selected */}
              {selectedBus && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pickup Stop Selection */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500 transition-colors ${formTransitionClass}"
                      value={selectedPickup}
                      onChange={(e) => setSelectedPickup(e.target.value)}
                    >
                      <option value="">Select pickup stop</option>
                      {availableStops.map((stop, index) => (
                        <option key={index} value={stop}>
                          {stop}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Stop Selection */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500 transition-colors ${formTransitionClass}"
                      value={selectedDestination}
                      onChange={(e) => setSelectedDestination(e.target.value)}
                      disabled={!selectedPickup}
                    >
                      <option value="">Select destination stop</option>
                      {availableStops
                        .filter((stop) => {
                          const pickupIndex = availableStops.indexOf(selectedPickup);
                          const currentIndex = availableStops.indexOf(stop);
                          return currentIndex > pickupIndex;
                        })
                        .map((stop, index) => (
                          <option key={index} value={stop}>
                            {stop}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Timing Selection */}
                  {selectedDestination && (
                    <div className="relative md:col-span-2">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500 transition-colors ${formTransitionClass}"
                        value={selectedTiming}
                        onChange={(e) => setSelectedTiming(e.target.value)}
                      >
                        <option value="">Select departure time</option>
                        {availableTimings.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

          {/* Passenger Count - Always show */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">Number of Passengers</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button 
                    type="button"
                    className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600 font-medium"
                    onClick={() => setPassengerCount(prev => Math.max(prev - 1, 1))}
                    disabled={passengerCount <= 1}
                  >
                    −
                  </button>
                  <div className="w-12 text-center font-medium text-gray-900">{passengerCount}</div>
                  <button 
                    type="button"
                    className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600 font-medium"
                    onClick={() => setPassengerCount(prev => Math.min(prev + 1, 10))}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">(Max: 10)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!selectedBus || !selectedPickup || !selectedDestination || !selectedTiming}
            onClick={handleContinueBooking}
          >
            Continue Booking
          </button>
        </form>
        ) : (
          <div>
            {!paymentSuccess ? (
              <>
                <div className="flex items-center mb-6">
                  <button 
                    onClick={goBackToBooking}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back to booking
                  </button>
                </div>
                
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Fare Details</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Bus</p>
                      <p className="font-medium">{selectedBus} - {busData.find(b => b.busId === selectedBus)?.route}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">{selectedTiming}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">{selectedPickup}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-medium">{selectedDestination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Passengers</p>
                      <p className="font-medium">{passengerCount}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Base Fare</p>
                      <p className="font-medium">₹{calculatedFare.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-600">Passengers</p>
                      <p className="font-medium">x {passengerCount}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                      <p className="text-lg font-semibold">Total Amount</p>
                      <p className="text-lg font-semibold text-primary-600">₹{totalFare.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPaymentMethod === 'card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                    onClick={() => handlePaymentMethodSelect('card')}
                  >
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 text-primary-600 mr-3" />
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPaymentMethod === 'upi' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                    onClick={() => handlePaymentMethodSelect('upi')}
                  >
                    <div className="flex items-center">
                      <Wallet className="h-6 w-6 text-primary-600 mr-3" />
                      <div>
                        <p className="font-medium">UPI</p>
                        <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPaymentMethod === 'netbanking' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                    onClick={() => handlePaymentMethodSelect('netbanking')}
                  >
                    <div className="flex items-center">
                      <DollarSign className="h-6 w-6 text-primary-600 mr-3" />
                      <div>
                        <p className="font-medium">Net Banking</p>
                        <p className="text-sm text-gray-500">All major banks</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  className="btn btn-primary w-full"
                  disabled={!selectedPaymentMethod || paymentProcessing}
                  onClick={processPayment}
                >
                  {paymentProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment
                    </span>
                  ) : (
                    `Pay ₹${totalFare.toFixed(2)}`
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">Your ticket has been booked successfully.</p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-base mb-3">Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Booking Reference</p>
                      <p className="font-medium">EB{Math.floor(Math.random() * 10000000)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bus</p>
                      <p className="font-medium">{selectedBus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">{selectedPickup}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-medium">{selectedDestination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">{selectedTiming}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Passengers</p>
                      <p className="font-medium">{passengerCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount Paid</p>
                      <p className="font-medium">₹{totalFare.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 justify-center">
                  <button 
                    onClick={() => window.print()} 
                    className="btn btn-outline-primary"
                  >
                    Print Ticket
                  </button>
                  <button 
                    onClick={() => window.location.href = '/'} 
                    className="btn btn-primary"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketBooking
