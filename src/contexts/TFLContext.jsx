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
};

// Initial state
const initialState = {
  lineStatus: {
    circle: null,
    bakerloo: null,
    district: null,
    central: null,
  },
  disruptions: {
    circle: [],
    bakerloo: [],
    district: [],
    central: [],
  },
  stations: {
    circle: [],
    bakerloo: [],
    district: [],
    central: [],
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
  const getLineColor = (line) => LINE_COLORS[line] || LINE_COLORS.circle;

  const getLineInfo = (line) => LINE_INFO[line] || LINE_INFO.circle;

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
