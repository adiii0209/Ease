import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Users, CreditCard, Wallet, DollarSign, ChevronLeft, Bus, MapPin, Clock } from 'lucide-react'
import busData from '../../buses.js'

const TicketBooking = () => {
  // Add click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      const pickupDropdown = document.getElementById('pickup-dropdown');
      const destinationDropdown = document.getElementById('destination-dropdown');
      
      if (pickupDropdown && !event.target.closest('.relative')) {
        pickupDropdown.style.display = 'none';
      }
      
      if (destinationDropdown && !event.target.closest('.relative')) {
        destinationDropdown.style.display = 'none';
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [selectedBus, setSelectedBus] = useState('')
  const [selectedPickup, setSelectedPickup] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [passengerCount, setPassengerCount] = useState(1)
  const [availableBuses, setAvailableBuses] = useState([])
  const [availableStops, setAvailableStops] = useState([])
  const [showFareDetails, setShowFareDetails] = useState(false)
  const [calculatedFare, setCalculatedFare] = useState(0)
  const [totalFare, setTotalFare] = useState(0)
  const [selectedTiming, setSelectedTiming] = useState('')
  const [availableTimings, setAvailableTimings] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Get URL parameters
  const location = useLocation()
  const [searchResults, setSearchResults] = useState([])
  const [searchError, setSearchError] = useState('')
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  // Load available buses on component mount
  useEffect(() => {
    setAvailableBuses(busData)
  }, [])

  // Handle URL parameters with auto-selecting
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const busId = params.get('busId')
    
    if (busId) {
      const bus = busData.find(b => b.busId === busId)
      if (bus) {
        setSelectedBus(busId)
        setAvailableStops(bus.stops)
        setAvailableTimings(bus.timings)
      }
    }
  }, [location.search])

  // Handle bus search and selection
  const handleBusSearch = (query) => {
    setSelectedBus(query)
    if (!query) {
      setSearchResults([])
      setSearchError('')
      return
    }

    const results = busData.filter(bus => 
      bus.busId.toLowerCase().includes(query.toLowerCase()) ||
      bus.route.toLowerCase().includes(query.toLowerCase())
    )

    if (results.length === 0) {
      setSearchError('No buses found matching your search')
    } else {
      setSearchError('')
    }

    setSearchResults(results)
  }

  // Update available stops when bus is selected
  useEffect(() => {
    if (selectedBus) {
      const bus = busData.find(b => b.busId === selectedBus)
      if (bus) {
        setAvailableStops(bus.stops)
        setAvailableTimings(bus.timings)
        
        // Only reset if no URL parameters are present
        const params = new URLSearchParams(location.search)
        if (!params.get('from') && !params.get('to')) {
          setSelectedPickup('')
          setSelectedDestination('')        
          setSelectedTiming('')
        }
      }
    }
  }, [selectedBus, location.search])
  
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
    <div className="container mx-auto px-4 py-4 page-transition">
      <div className="flex items-center mb-6">
        {location.state?.from === 'bus-details' && (
          <Link to={-1} className="mr-4">
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </Link>
        )}
        <h1 className="text-xl font-semibold text-gray-900">Buy Bus Tickets</h1>
      </div>

      <div className="space-y-6">
        {!showFareDetails ? (
          <form>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route/Bus No</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Search by bus number or route"
                    value={selectedBus}
                    onChange={(e) => handleBusSearch(e.target.value)}
                  />
                  {searchResults.length > 0 && selectedBus && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((bus) => (
                        <button
                          key={bus.busId}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                          onClick={() => {
                            setSelectedBus(bus.busId)
                            setSearchResults([])
                          }}
                        >
                          <div className="font-medium">{bus.busId}</div>
                          <div className="text-sm text-gray-500">{bus.route}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchError && (
                    <p className="mt-2 text-sm text-red-600">{searchError}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup and Destination Stop</label>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="relative">
                    {/* Pickup Stop */}
                    <div className="flex items-center mb-4">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="relative w-full">
                      <input
                        type="text"
                        className="w-full ml-3 pl-3 pr-8 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500 cursor-pointer"
                        placeholder="Select pickup point"
                        value={selectedPickup}
                        readOnly
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.getElementById('pickup-dropdown');
                          if (element) {
                            element.style.display = 'block';
                          }
                        }}
                      />
                      {availableStops.length > 0 && (
                        <div
                          id="pickup-dropdown"
                          className="absolute z-10 w-full mt-1 ml-3 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          style={{ display: 'none' }}
                        >
                          {availableStops.map((stop, index) => (
                            <button
                              type="button"
                              key={index}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedPickup(stop);
                                setSelectedDestination('');
                                document.getElementById('pickup-dropdown').style.display = 'none';
                              }}
                            >
                              {stop}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                      </div>
                    </div>

                    {/* Vertical Line */}
                    <div className="absolute left-3 top-10 bottom-10 w-[1px] bg-gray-300" />

                    {/* Destination Stop */}
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="relative w-full">
                      <input
                        type="text"
                        className="w-full ml-3 pl-3 pr-8 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Select destination"
                        value={selectedDestination}
                        readOnly
                        disabled={!selectedPickup}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!selectedPickup) return;
                          const element = document.getElementById('destination-dropdown');
                          if (element) {
                            element.style.display = 'block';
                          }
                        }}
                      />
                      {selectedPickup && availableStops.length > 0 && (
                        <div
                          id="destination-dropdown"
                          className="absolute z-10 w-full mt-1 ml-3 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          style={{ display: 'none' }}
                        >
                          {availableStops
                            .filter((stop, index) => index > availableStops.indexOf(selectedPickup))
                            .map((stop, index) => (
                              <button
                                type="button"
                                key={index}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedDestination(stop);
                                  document.getElementById('destination-dropdown').style.display = 'none';
                                }}
                              >
                                {stop}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timing Selection - Only show after stops are selected */}
                {selectedPickup && selectedDestination && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time</label>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <select
                        className="w-full pl-3 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500 transition-colors"
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
                  </div>
                )}
              </div>

              {/* Passenger Count - Always show */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No of Passengers</label>
                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{passengerCount} Passenger{passengerCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      onClick={() => setPassengerCount(prev => Math.max(prev - 1, 1))}
                      disabled={passengerCount <= 1}
                    >
                      −
                    </button>
                    <button 
                      type="button"
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      onClick={() => setPassengerCount(prev => Math.min(prev + 1, 10))}
                      disabled={passengerCount >= 10}
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">Maximum 10 tickets are allowed per user.</p>
              </div>

              <div className="bg-gray-150 p-4 rounded-lg space-y-2 border border-gray-200">
                <div className="flex items-start space-x-2">
                  <span className="text-gray-400">•</span>
                  <p className="text-gray-600">Cancellation of tickets is not applicable</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-gray-400">•</span>
                  <p className="text-gray-600">The ticket is valid for only 30 minutes from the time of booking</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-gray-400">•</span>
                  <p className="text-gray-600">Fare is commission-free and determined by the WBTC</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleContinueBooking}
                disabled={!selectedBus || !selectedPickup || !selectedDestination || !selectedTiming}
              >
                Get Fare
              </button>
            </div>
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
