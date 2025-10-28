/*
  ATTENTION: If you see errors like "Could not resolve 'react-native'"
  or "Could not resolve 'expo-secure-store'", THIS IS NORMAL inside
  this editor.

  These files are provided by your local Expo project.
  
  Please IGNORE these specific errors. Your app will compile
  correctly when you run `npx expo start` on your computer.
*/
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

// --- Configuration ---
// CRITICAL: Replace this with your backend server's URL
// (e.g., 'http://192.168.1.10:3000/api')
const API_URL = 'http://192.168.1.179:3000/api'; // Using your IP from our last chat
// ---

// --- Util Functions ---
const formatDuration = (isoDuration) => {
  if (!isoDuration) return '';
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return isoDuration;
  const hours = match[1] ? match[1].replace('H', 'h') : '';
  const minutes = match[2] ? match[2].replace('M', 'm') : '';
  return `${hours} ${minutes}`.trim();
};
const formatTime = (time) => time ? time.substring(0, 5) : '';
// ---

export default function App() {
  // --- State ---
  const [currentScreen, setCurrentScreen] = useState('Login'); // 'Login', 'Search', 'Results', 'Booking', 'BookingConfirmation'
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login
  const [email, setEmail] = useState('test');
  const [password, setPassword] = useState('test');

  // Search
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);

  // Results
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null); // For booking
  
  // Phase 4: Real-time Details State
  const [expandedTripId, setExpandedTripId] = useState(null); // Which trip card is open
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Booking
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookPhone, setBookPhone] = useState('');

  // Debounce Refs
  const fromTimeout = useRef(null);
  const toTimeout = useRef(null);

  // --- Auth Functions ---
  useEffect(() => {
    // Check for saved token on app load
    const loadToken = async () => {
      setIsLoading(true);
      try {
        const savedToken = await SecureStore.getItemAsync('authToken');
        if (savedToken) {
          setToken(savedToken);
          setCurrentScreen('Search');
        }
      } catch (e) { console.error('Failed to load token', e); }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      await SecureStore.setItemAsync('authToken', data.token);
      setToken(data.token);
      setCurrentScreen('Search');
    } catch (e) {
      setError(e.message);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setToken(null);
    setCurrentScreen('Login');
    setFromQuery('');
    setToQuery('');
    setSelectedFrom(null);
    setSelectedTo(null);
    setSearchResults([]);
    setSelectedTrip(null);
    setBookName('');
    setBookEmail('');
    setBookPhone('');
    setExpandedTripId(null);
    setSelectedTripDetails(null);
  };

  // --- API Functions ---
  const fetchSuggestions = async (query, setSuggestions) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/proxy/location?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.stopLocationOrCoordLocation) {
        setSuggestions(data.stopLocationOrCoordLocation);
      }
    } catch (e) {
      console.error('Failed to fetch suggestions', e);
      if (e.response && e.response.status === 401) handleLogout();
    }
  };

  // Debounce 'From' input
  useEffect(() => {
    if (fromTimeout.current) clearTimeout(fromTimeout.current);
    fromTimeout.current = setTimeout(() => {
      if (token && fromQuery.length > 2 && !selectedFrom) {
        fetchSuggestions(fromQuery, setFromSuggestions);
      }
    }, 300);
    return () => clearTimeout(fromTimeout.current);
  }, [fromQuery, token, selectedFrom]);

  // Debounce 'To' input
  useEffect(() => {
    if (toTimeout.current) clearTimeout(toTimeout.current);
    toTimeout.current = setTimeout(() => {
      if (token && toQuery.length > 2 && !selectedTo) {
        fetchSuggestions(toQuery, setToSuggestions);
      }
    }, 300);
    return () => clearTimeout(toTimeout.current);
  }, [toQuery, token, selectedTo]);

  const handleSearchTrips = async () => {
    if (!selectedFrom || !selectedTo) {
      setError('Välj en giltig start- och slutstation.');
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setExpandedTripId(null); // Close any open cards
    setSelectedTripDetails(null);

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().substring(0, 5);

    try {
      const response = await fetch(
        `${API_URL}/proxy/trip?fromId=${selectedFrom.mainMastExtId || selectedFrom.extId}&toId=${selectedTo.mainMastExtId || selectedTo.extId}&date=${date}&time=${time}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Trip search failed');
      
      setSearchResults(data.Trip || []);
      setCurrentScreen('Results');
    } catch (e) {
      setError(e.message);
      if (e.response && e.response.status === 401) handleLogout();
    }
    setIsLoading(false);
  };
  
  // --- Phase 4: Fetch Real-time Journey Details ---
  const handleFetchJourneyDetails = async (trip) => {
    // We get the ref from the *first* leg of the trip.
    // This is a simplification; a more complex app might need to fetch details for all legs.
    const journeyRef = trip.LegList.Leg[0]?.journeyDetailRef?.ref;
    if (!journeyRef) {
      console.log('No journeyRef found for this leg.');
      return;
    }

    // Toggle logic
    if (expandedTripId === trip.ctxRecon) {
      setExpandedTripId(null);
      setSelectedTripDetails(null);
      return;
    }

    setExpandedTripId(trip.ctxRecon);
    setIsLoadingDetails(true);
    setSelectedTripDetails(null); // Clear old details
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/proxy/journey-detail?ref=${encodeURIComponent(journeyRef)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get journey details');
      }
      
      // The data is nested, find the JourneyDetail
      if (data.JourneyDetail) {
        // Ensure Stops is always an array, as ResRobot returns an object if there's only one stop
        const stops = Array.isArray(data.JourneyDetail.Stop) 
          ? data.JourneyDetail.Stop 
          : [data.JourneyDetail.Stop];
        setSelectedTripDetails(stops);
      } else {
        throw new Error('JourneyDetail not found in response');
      }

    } catch (e) {
      setError(e.message);
      if (e.response && e.response.status === 401) handleLogout();
    }
    setIsLoadingDetails(false);
  };


  // --- Handle Booking (Phase 3) ---
  const handleBooking = async () => {
    if (!bookName || !bookEmail || !bookPhone || !selectedTrip) {
        setError('Alla fält är obligatoriska.');
        return;
    }
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
        const response = await fetch(`${API_URL}/booking/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: bookName,
                email: bookEmail,
                phone: bookPhone,
                trip: selectedTrip,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Bokningen misslyckades');
        }

        // Success! Go to confirmation screen
        setCurrentScreen('BookingConfirmation');

    } catch (e) {
      setError(e.message);
      if (e.response && e.response.status === 401) handleLogout();
    }
    setIsLoading(false);
  };


  // --- Render Functions ---
  const renderLoginScreen = () => (
    <View style={styles.container}>
      <Image
        // This requires the logo file to be in travel-app-frontend-v2/assets/
        // If you don't have the file, use a placeholder:
        // source={{ uri: 'https://placehold.co/400x200/003366/FFFFFF?text=ResPlus+Logotyp&font=inter' }}
        source={require('./assets/resplusdunderlogga.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TextInput
        style={styles.input}
        placeholder="Användarnamn"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Lösenord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Loggar in...' : 'Logga in'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchScreen = () => (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Image
          source={require('./assets/resplusdunderlogga.jpg')}
          style={styles.logoSmall}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logga ut</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Sök resa</Text>

      {/* From Input */}
      <Text style={styles.label}>Från</Text>
      <TextInput
        style={styles.input}
        placeholder="T.ex. Stockholm C"
        value={fromQuery}
        onChangeText={(text) => {
          setFromQuery(text);
          setSelectedFrom(null);
          if (text.length < 3) setFromSuggestions([]);
        }}
      />
      {fromSuggestions.length > 0 && (
        <FlatList
          style={styles.suggestionsList}
          data={fromSuggestions.slice(0, 5)}
          keyExtractor={(item) => item.extId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => {
                setFromQuery(item.name);
                setSelectedFrom(item);
                setFromSuggestions([]);
              }}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* To Input */}
      <Text style={styles.label}>Till</Text>
      <TextInput
        style={styles.input}
        placeholder="T.ex. Göteborg C"
        value={toQuery}
        onChangeText={(text) => {
          setToQuery(text);
          setSelectedTo(null);
          if (text.length < 3) setToSuggestions([]);
        }}
      />
      {toSuggestions.length > 0 && (
        <FlatList
          style={styles.suggestionsList}
          data={toSuggestions.slice(0, 5)}
          keyExtractor={(item) => item.extId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => {
                setToQuery(item.name);
                setSelectedTo(item);
                setToSuggestions([]);
              }}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, styles.searchButton, (!selectedFrom || !selectedTo) && styles.buttonDisabled]}
        onPress={handleSearchTrips}
        disabled={!selectedFrom || !selectedTo || isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Söker...' : 'Sök'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // --- Phase 4: Render Real-time Details ---
  const renderJourneyDetails = () => {
    if (isLoadingDetails) {
      return <ActivityIndicator style={{ marginVertical: 15 }} size="small" color="#007AFF" />;
    }
    if (!selectedTripDetails) {
      // Don't show anything if there are no details (e.g., for a 'Gång' leg)
      return null;
    }
    
    return (
      <View style={styles.detailsContainer}>
        {selectedTripDetails.map((stop, index) => {
          // Check for cancellations
          const isCancelled = stop.rtArrTime === 'CANCELLED' || stop.rtDepTime === 'CANCELLED';
          
          // Determine displayed times, preferring real-time if it exists
          const arrTime = (stop.rtArrTime && stop.rtArrTime !== stop.arrTime) ? stop.rtArrTime : stop.arrTime;
          const depTime = (stop.rtDepTime && stop.rtDepTime !== stop.depTime) ? stop.rtDepTime : stop.depTime;
          
          // Check if there is a delay
          const hasArrDelay = stop.rtArrTime && stop.rtArrTime !== stop.arrTime;
          const hasDepDelay = stop.rtDepTime && stop.rtDepTime !== stop.depTime;
          
          return (
            <View key={index} style={[styles.stopRow, isCancelled && styles.stopCancelled]}>
              <View style={styles.stopTimeContainer}>
                {/* Show Arrival Time if it exists */}
                {stop.arrTime && (
                  <Text style={[styles.stopTime, hasArrDelay && styles.realtimeActual]}>
                    {formatTime(arrTime)}
                  </Text>
                )}
                {/* Show Departure Time if it exists */}
                {stop.depTime && (
                  <Text style={[styles.stopTime, hasDepDelay && styles.realtimeActual]}>
                    {formatTime(depTime)}
                  </Text>
                )}
              </View>
              <View style={styles.stopInfoContainer}>
                <Text style={styles.stopName}>{stop.name}</Text>
                {stop.track && <Text style={styles.stopTrack}>Spår {stop.track}</Text>}
                {isCancelled && <Text style={styles.realtimeDelay}>Inställd</Text>}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderResultsScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('Search')}>
          <Text style={styles.backButton}>&larr; Ny sökning</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logga ut</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Sökresultat</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : searchResults.length === 0 ? (
        <Text style={styles.centerText}>Inga resor hittades.</Text>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => item.ctxRecon || index.toString()}
          renderItem={({ item }) => {
            const firstLeg = item.LegList.Leg[0];
            const lastLeg = item.LegList.Leg[item.LegList.Leg.length - 1];
            const transport = item.LegList.Leg.map(leg => 
              leg.Product?.catOut?.replace(/(\w).*/, '$1') || 'Gång' // T, B, G
            ).join(' \u203A '); // ›
            
            // Check if this card is the one that's expanded
            const isExpanded = expandedTripId === item.ctxRecon;

            return (
              <TouchableOpacity
                style={styles.tripCard}
                onPress={() => handleFetchJourneyDetails(item)} // Make the whole card tappable
              >
                <View style={styles.tripRow}>
                  <View>
                    <Text style={styles.tripTime}>{formatTime(firstLeg.Origin.time)}</Text>
                    <Text style={styles.tripStation}>{firstLeg.Origin.name}</Text>
                  </View>
                  <View>
                    <Text style={styles.tripTimeRight}>{formatTime(lastLeg.Destination.time)}</Text>
                    <Text style={styles.tripStationRight}>{lastLeg.Destination.name}</Text>
                  </View>
                </View>
                <View style={styles.tripRow}>
                  <Text style={styles.tripDuration}>{formatDuration(item.duration)}</Text>
                  <Text style={styles.tripTransport}>{transport}</Text>
                </View>
                
                {/* Realtime Info (if available on the first leg) */}
                {firstLeg.Origin.rtTime && firstLeg.Origin.rtTime !== firstLeg.Origin.time && (
                  <Text style={styles.realtimeDelay}>
                    Ny avg. {formatTime(firstLeg.Origin.rtTime)}
                  </Text>
                )}
                
                {/* Phase 4: Expanded Details */}
                {isExpanded && renderJourneyDetails()}
                
                <TouchableOpacity 
                  style={styles.bookButton}
                  onPress={() => {
                    setSelectedTrip(item);
                    if (email !== 'test') setBookEmail(email); // Pre-fill email
                    setCurrentScreen('Booking');
                  }}
                >
                  <Text style={styles.bookButtonText}>Boka nu</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );

  const renderBookingScreen = () => (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentScreen('Results')}>
            <Text style={styles.backButton}>&larr; Tillbaka</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logga ut</Text>
            </TouchableOpacity>
        </View>
        <Text style={styles.title}>Slutför bokning</Text>
        
        {selectedTrip && (
            <View style={styles.tripSummary}>
                <Text style={styles.summaryTitle}>Din resa:</Text>
                <Text style={styles.summaryText}>
                    {selectedTrip.LegList.Leg[0].Origin.name} &rarr; {selectedTrip.LegList.Leg[selectedTrip.LegList.Leg.length - 1].Destination.name}
                </Text>
                <Text style={styles.summaryText}>
                    Avgång: {formatTime(selectedTrip.LegList.Leg[0].Origin.time)} | Ankomst: {formatTime(selectedTrip.LegList.Leg[selectedTrip.LegList.Leg.length - 1].Destination.time)}
                </Text>
            </View>
        )}

        <Text style={styles.label}>Namn</Text>
        <TextInput
            style={styles.input}
            placeholder="Kalle Anka"
            value={bookName}
            onChangeText={setBookName}
        />

        <Text style={styles.label}>E-post</Text>
        <TextInput
            style={styles.input}
            placeholder="din.email@exempel.se"
            value={bookEmail}
            onChangeText={setBookEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <Text style={styles.label}>Telefonnummer</Text>
        <TextInput
            style={styles.input}
            placeholder="0701234567"
            value={bookPhone}
            onChangeText={setBookPhone}
            keyboardType="phone-pad"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <TouchableOpacity
            style={[styles.button, styles.searchButton, (!bookName || !bookEmail || !bookPhone) && styles.buttonDisabled]}
            onPress={handleBooking}
            disabled={isLoading || !bookName || !bookEmail || !bookPhone}
        >
            <Text style={styles.buttonText}>
            {isLoading ? 'Bokar...' : 'Bekräfta och boka'}
            </Text>
        </TouchableOpacity>
    </ScrollView>
  );

  // --- (Phase 3) ---
  const renderBookingConfirmationScreen = () => (
    <View style={styles.container}>
        <View style={styles.header}>
            <View />
            <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logoutText}>Logga ut</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.confirmationContent}>
            <Text style={styles.title}>Tack för din bokning!</Text>
            <Text style={styles.centerText}>
                En bekräftelse och din PDF-biljett har skickats till {bookEmail}.
            </Text>
            <Text style={styles.centerText}>Trevlig resa!</Text>

            <TouchableOpacity
                style={[styles.button, {marginTop: 30}]}
                onPress={() => {
                    // Reset all state and go back to search screen
                    setBookName('');
                    setBookEmail('');
                    setBookPhone('');
                    setSelectedTrip(null);
                    setSearchResults([]);
                    setFromQuery('');
                    setToQuery('');
                    setSelectedFrom(null);
                    setSelectedTo(null);
                    setExpandedTripId(null);
                    setSelectedTripDetails(null);
                    setCurrentScreen('Search');
                }}
            >
                <Text style={styles.buttonText}>Gör en ny sökning</Text>
            </TouchableOpacity>
        </View>
    </View>
  );


  // --- Main Render ---
  const renderScreen = () => {
    if (isLoading && !token && currentScreen !== 'Login') {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }
    switch (currentScreen) {
      case 'Login': return renderLoginScreen();
      case 'Search': return renderSearchScreen();
      case 'Results': return renderResultsScreen();
      case 'Booking': return renderBookingScreen();
      case 'BookingConfirmation': return renderBookingConfirmationScreen();
      default: return renderLoginScreen();
    }
  };

  return <SafeAreaView style={styles.safeArea}>{renderScreen()}</SafeAreaView>;
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f8' },
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f8' },
  logo: {
    width: '80%',
    height: 150,
    alignSelf: 'center',
    marginBottom: 30,
    marginTop: 50,
  },
  logoSmall: { width: 100, height: 50, resizeMode: 'contain' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  searchButton: { backgroundColor: '#34C759' },
  buttonDisabled: { backgroundColor: '#a9a9a9' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutText: { color: '#007AFF', fontSize: 16 },
  backButton: { color: '#007AFF', fontSize: 16 },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 10,
  },
  suggestionsList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  centerText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#555',
  },
  // Trip Card Styles
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tripTime: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  tripTimeRight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'right',
  },
  tripStation: { fontSize: 14, color: '#555' },
  tripStationRight: { fontSize: 14, color: '#555', textAlign: 'right' },
  tripDuration: { fontSize: 14, color: '#333', fontWeight: '500' },
  tripTransport: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  realtimeDelay: {
    color: '#D90429', // Red
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  // Phase 3 Styles
  tripSummary: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 3,
  },
  confirmationContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 50, // Offset to center vertically
  },
  // Phase 4: Journey Details Styles
  detailsContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  stopTimeContainer: {
    width: 60,
  },
  stopTime: {
    fontSize: 14,
    color: '#333',
  },
  stopInfoContainer: {
    flex: 1,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  stopTrack: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  realtimeActual: {
    color: '#D90429', // Red
    fontWeight: 'bold',
  },
  stopCancelled: {
    opacity: 0.5,
    backgroundColor: '#fee',
  },
});

