import { createContext, useContext, useReducer, useEffect } from 'react';

// TFL state types
const TFL_ACTIONS = {
  SET_LINE_STATUS: 'SET_LINE_STATUS',
  SET_DISRUPTIONS: 'SET_DISRUPTIONS',
  SET_STATIONS: 'SET_STATIONS',
  SET_JOURNEY_PLAN: 'SET_JOURNEY_PLAN',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SELECTED_LINE: 'SET_SELECTED_LINE',
  SET_LIVE_DATA: 'SET_LIVE_DATA',
};

// Line color mappings
const LINE_COLORS = {
  circle: {
    primary: '#FFD300',
    secondary: '#E6BE00',
    text: 'text-black',
    bg: 'bg-circle',
    border: 'border-circle',
  },
  bakerloo: {
    primary: '#B36305',
    secondary: '#8F4F04',
    text: 'text-white',
    bg: 'bg-bakerloo',
    border: 'border-bakerloo',
  },
  district: {
    primary: '#00782A',
    secondary: '#005A1F',
    text: 'text-white',
    bg: 'bg-district',
    border: 'border-district',
  },
  central: {
    primary: '#E32017',
    secondary: '#C71C0C',
    text: 'text-white',
    bg: 'bg-central',
    border: 'border-central',
  },
  northern: {
    primary: '#000000',
    secondary: '#333333',
    text: 'text-white',
    bg: 'bg-northern',
    border: 'border-northern',
  },
  piccadilly: {
    primary: '#003688',
    secondary: '#002455',
    text: 'text-white',
    bg: 'bg-piccadilly',
    border: 'border-piccadilly',
  },
  victoria: {
    primary: '#0098D4',
    secondary: '#0077AA',
    text: 'text-white',
    bg: 'bg-victoria',
    border: 'border-victoria',
  },
  jubilee: {
    primary: '#A0A5A9',
    secondary: '#7D8387',
    text: 'text-white',
    bg: 'bg-jubilee',
    border: 'border-jubilee',
  },
  metropolitan: {
    primary: '#9B0056',
    secondary: '#7A0044',
    text: 'text-white',
    bg: 'bg-metropolitan',
    border: 'border-metropolitan',
  },
  hammersmith_city: {
    primary: '#F3A9BB',
    secondary: '#E088A1',
    text: 'text-black',
    bg: 'bg-hammersmith-city',
    border: 'border-hammersmith-city',
  },
  waterloo_city: {
    primary: '#95CDBA',
    secondary: '#7AB8A3',
    text: 'text-black',
    bg: 'bg-waterloo-city',
    border: 'border-waterloo-city',
  },
  elizabeth: {
    primary: '#7156A5',
    secondary: '#5A4382',
    text: 'text-white',
    bg: 'bg-elizabeth',
    border: 'border-elizabeth',
  },
  status: {
    primary: '#374151',
    secondary: '#1F2937',
    text: 'text-white',
    bg: 'bg-gray-600',
    border: 'border-gray-600',
  },
};

// Line information
const LINE_INFO = {
  circle: {
    name: 'Circle Line',
    description: 'Serving central London in a loop around Zone 1',
    zones: ['1', '2'],
    termini: ['Edgware Road', 'Hammersmith'],
    icon: '⭕',
  },
  bakerloo: {
    name: 'Bakerloo Line',
    description: 'From Harrow & Wealdstone to Elephant & Castle',
    zones: ['1', '2', '3', '4', '5'],
    termini: ['Harrow & Wealdstone', 'Elephant & Castle'],
    icon: '🟤',
  },
  district: {
    name: 'District Line',
    description: 'Multiple branches serving West and Southwest London',
    zones: ['1', '2', '3', '4', '5', '6'],
    termini: ['Ealing Broadway', 'Richmond', 'Wimbledon', 'Upminster'],
    icon: '🟢',
  },
  central: {
    name: 'Central Line',
    description: 'East-west across London from West Ruislip to Epping/Hainault',
    zones: ['1', '2', '3', '4', '5', '6'],
    termini: ['West Ruislip', 'Ealing Broadway', 'Epping', 'Hainault'],
    icon: '🔴',
  },
  northern: {
    name: 'Northern Line',
    description: 'North-south through London with Charing Cross and Bank branches',
    zones: ['1', '2', '3', '4', '5', '6'],
    termini: ['Morden', 'Edgware', 'High Barnet', 'Mill Hill East'],
    icon: '⚫',
  },
  piccadilly: {
    name: 'Piccadilly Line',
    description: 'London\'s longest line serving Heathrow Airport',
    zones: ['1', '2', '3', '4', '5', '6'],
    termini: ['Cockfosters', 'Heathrow T2&3', 'Heathrow T4', 'Heathrow T5', 'Uxbridge'],
    icon: '🔵',
  },
  victoria: {
    name: 'Victoria Line',
    description: 'High-frequency automated line from North to South London',
    zones: ['1', '2', '3'],
    termini: ['Brixton', 'Walthamstow Central'],
    icon: '🔷',
  },
  jubilee: {
    name: 'Jubilee Line',
    description: 'Modern line serving Canary Wharf and Greenwich',
    zones: ['1', '2', '3', '4'],
    termini: ['Stanmore', 'Stratford'],
    icon: '🔘',
  },
  metropolitan: {
    name: 'Metropolitan Line',
    description: 'Historic line extending into Buckinghamshire countryside',
    zones: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    termini: ['Aldgate', 'Amersham', 'Chesham', 'Uxbridge', 'Watford'],
    icon: '🟣',
  },
  hammersmith_city: {
    name: 'Hammersmith & City Line',
    description: 'Cross-London connector from West to East',
    zones: ['1', '2', '3', '4', '5', '6'],
    termini: ['Hammersmith', 'Barking'],
    icon: '🌸',
  },
  waterloo_city: {
    name: 'Waterloo & City Line',
    description: 'Business shuttle between Waterloo and Bank (weekdays only)',
    zones: ['1'],
    termini: ['Waterloo', 'Bank'],
    icon: '🔧',
  },
  elizabeth: {
    name: 'Elizabeth Line',
    description: 'London\'s newest high-capacity cross-city railway',
    zones: ['1', '2', '3', '4', '5', '6'],
    termini: ['Reading', 'Heathrow T2&3', 'Heathrow T4', 'Heathrow T5', 'Abbey Wood', 'Shenfield'],
    icon: '🟪',
  },
  status: {
    name: 'Network Status',
    description: 'London Underground network-wide service information',
    zones: ['All'],
    termini: ['Network-wide coverage'],
    icon: '📊',
  },
};

// Initial state
const initialState = {
  lineStatus: {
    circle: null,
    bakerloo: null,
    district: null,
    central: null,
    northern: null,
    piccadilly: null,
    victoria: null,
    jubilee: null,
    metropolitan: null,
    hammersmith_city: null,
    waterloo_city: null,
    elizabeth: null,
    status: null,
  },
  disruptions: {
    circle: [],
    bakerloo: [],
    district: [],
    central: [],
    northern: [],
    piccadilly: [],
    victoria: [],
    jubilee: [],
    metropolitan: [],
    hammersmith_city: [],
    waterloo_city: [],
    elizabeth: [],
    status: [],
  },
  stations: {
    circle: [],
    bakerloo: [],
    district: [],
    central: [],
    northern: [],
    piccadilly: [],
    victoria: [],
    jubilee: [],
    metropolitan: [],
    hammersmith_city: [],
    waterloo_city: [],
    elizabeth: [],
    status: [],
  },
  journeyPlan: null,
  selectedLine: null,
  liveData: {
    lastUpdated: null,
    arrivals: {},
    platformInfo: {},
  },
  isLoading: false,
  error: null,
};

// Reducer function
function tflReducer(state, action) {
  switch (action.type) {
    case TFL_ACTIONS.SET_LINE_STATUS:
      return {
        ...state,
        lineStatus: {
          ...state.lineStatus,
          [action.payload.line]: action.payload.status,
        },
        error: null,
      };

    case TFL_ACTIONS.SET_DISRUPTIONS:
      return {
        ...state,
        disruptions: {
          ...state.disruptions,
          [action.payload.line]: action.payload.disruptions,
        },
        error: null,
      };

    case TFL_ACTIONS.SET_STATIONS:
      return {
        ...state,
        stations: {
          ...state.stations,
          [action.payload.line]: action.payload.stations,
        },
        error: null,
      };

    case TFL_ACTIONS.SET_JOURNEY_PLAN:
      return {
        ...state,
        journeyPlan: action.payload,
        error: null,
      };

    case TFL_ACTIONS.SET_SELECTED_LINE:
      return {
        ...state,
        selectedLine: action.payload,
      };

    case TFL_ACTIONS.SET_LIVE_DATA:
      return {
        ...state,
        liveData: {
          ...state.liveData,
          ...action.payload,
          lastUpdated: new Date().toISOString(),
        },
        error: null,
      };

    case TFL_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case TFL_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
}

// Create context
const TFLContext = createContext();

// Provider component
export function TFLProvider({ children }) {
  const [state, dispatch] = useReducer(tflReducer, initialState);

  // Actions
  const actions = {
    setLineStatus: (line, status) => {
      dispatch({
        type: TFL_ACTIONS.SET_LINE_STATUS,
        payload: { line, status },
      });
    },

    setDisruptions: (line, disruptions) => {
      dispatch({
        type: TFL_ACTIONS.SET_DISRUPTIONS,
        payload: { line, disruptions },
      });
    },

    setStations: (line, stations) => {
      dispatch({
        type: TFL_ACTIONS.SET_STATIONS,
        payload: { line, stations },
      });
    },

    setJourneyPlan: (journeyPlan) => {
      dispatch({ type: TFL_ACTIONS.SET_JOURNEY_PLAN, payload: journeyPlan });
    },

    setSelectedLine: (line) => {
      dispatch({ type: TFL_ACTIONS.SET_SELECTED_LINE, payload: line });
    },

    setLiveData: (data) => {
      dispatch({ type: TFL_ACTIONS.SET_LIVE_DATA, payload: data });
    },

    setLoading: (loading) => {
      dispatch({ type: TFL_ACTIONS.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: TFL_ACTIONS.SET_ERROR, payload: error });
    },
  };

  // Helper functions
  const normalizeAgentName = (agentName) => {
    if (!agentName) return null;
    // Convert backend agent names (e.g., 'HAMMERSMITH_CITY') to frontend keys (e.g., 'hammersmith_city')
    return agentName.toLowerCase();
  };

  const getLineColor = (line) => {
    const normalizedLine = normalizeAgentName(line);
    return LINE_COLORS[normalizedLine] || LINE_COLORS.circle;
  };

  const getLineInfo = (line) => {
    const normalizedLine = normalizeAgentName(line);
    return LINE_INFO[normalizedLine] || LINE_INFO.circle;
  };

  const getServiceStatus = (line) => {
    const status = state.lineStatus[line];
    if (!status) return { level: 'unknown', text: 'Unknown' };

    const statusLevel =
      status.statusSeverityDescription?.toLowerCase() || 'unknown';

    if (statusLevel.includes('good'))
      return { level: 'good', text: 'Good Service' };
    if (statusLevel.includes('minor'))
      return { level: 'minor', text: 'Minor Delays' };
    if (statusLevel.includes('severe'))
      return { level: 'severe', text: 'Severe Delays' };
    if (statusLevel.includes('suspended'))
      return { level: 'severe', text: 'Service Suspended' };

    return { level: 'unknown', text: statusLevel };
  };

  const hasActiveDisruptions = (line) => {
    return state.disruptions[line]?.length > 0;
  };

  return (
    <TFLContext.Provider
      value={{
        ...state,
        ...actions,
        normalizeAgentName,
        getLineColor,
        getLineInfo,
        getServiceStatus,
        hasActiveDisruptions,
      }}
    >
      {children}
    </TFLContext.Provider>
  );
}

// Hook to use TFL context
export function useTFL() {
  const context = useContext(TFLContext);
  if (!context) {
    throw new Error('useTFL must be used within a TFLProvider');
  }
  return context;
}

export { TFL_ACTIONS, LINE_COLORS, LINE_INFO };
