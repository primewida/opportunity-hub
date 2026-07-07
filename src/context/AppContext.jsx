import { createContext, useContext, useReducer, useCallback } from 'react';

/* ── Mock current user ── */
const CURRENT_USER = {
  id: 'user_001',
  firstName: 'Chidi',
  lastName: 'Okonkwo',
  email: 'chidi.okonkwo@example.com',
  avatar: null,
  phone: '+234 801 234 5678',
  state: 'Lagos',
  university: 'University of Lagos',
  educationLevel: 'undergraduate',
  fieldOfStudy: 'Computer Science',
  graduationYear: 2026,
  nyscStatus: 'Prospective',
  interests: ['Technology', 'Entrepreneurship', 'Data Science'],
  bio: 'Passionate computer science student interested in AI and building impactful products.',
  skills: ['Python', 'React', 'Machine Learning', 'UI/UX Design'],
  gpa: 4.2,
  documents: [],
};

/* ── Initial State ── */
const initialState = {
  user: CURRENT_USER,
  auth: {
    isAuthenticated: false,
    hasCompletedOnboarding: false,
    hasCompletedProfile: false,
  },
  savedOpportunities: [],
  notifications: [],
  applications: {
    saved: [],
    preparing: [],
    applied: [],
    interviewing: [],
    accepted: [],
    rejected: [],
  },
  documents: [],
  streakData: {
    currentStreak: 12,
    longestStreak: 23,
    totalHours: 47,
    goalDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    goalMinutes: 30,
    calendar: {},
  },
};

/* ── Action Types ── */
const ActionTypes = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  COMPLETE_ONBOARDING: 'COMPLETE_ONBOARDING',
  COMPLETE_PROFILE: 'COMPLETE_PROFILE',
  TOGGLE_SAVE: 'TOGGLE_SAVE',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  UPDATE_APPLICATION: 'UPDATE_APPLICATION',
  MOVE_APPLICATION: 'MOVE_APPLICATION',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',
  UPDATE_STREAK: 'UPDATE_STREAK',
};

/* ── Reducer ── */
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.LOGIN:
      return {
        ...state,
        auth: { ...state.auth, isAuthenticated: true },
        user: { ...state.user, ...action.payload },
      };

    case ActionTypes.LOGOUT:
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          hasCompletedProfile: false,
        },
        user: CURRENT_USER,
        savedOpportunities: [],
        notifications: [],
      };

    case ActionTypes.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case ActionTypes.COMPLETE_ONBOARDING:
      return {
        ...state,
        auth: { ...state.auth, hasCompletedOnboarding: true },
      };

    case ActionTypes.COMPLETE_PROFILE:
      return {
        ...state,
        auth: { ...state.auth, hasCompletedProfile: true },
        user: { ...state.user, ...action.payload },
      };

    case ActionTypes.TOGGLE_SAVE: {
      const oppId = action.payload;
      const isSaved = state.savedOpportunities.includes(oppId);
      return {
        ...state,
        savedOpportunities: isSaved
          ? state.savedOpportunities.filter((id) => id !== oppId)
          : [...state.savedOpportunities, oppId],
      };
    }

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          {
            id: Date.now().toString(),
            read: false,
            timestamp: new Date().toISOString(),
            ...action.payload,
          },
          ...state.notifications,
        ],
      };

    case ActionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case ActionTypes.UPDATE_APPLICATION: {
      const { status, application } = action.payload;
      const key = status.toLowerCase();
      return {
        ...state,
        applications: {
          ...state.applications,
          [key]: state.applications[key].map((app) =>
            app.id === application.id ? { ...app, ...application } : app
          ),
        },
      };
    }

    case ActionTypes.MOVE_APPLICATION: {
      const { applicationId, fromStatus, toStatus } = action.payload;
      const fromKey = fromStatus.toLowerCase();
      const toKey = toStatus.toLowerCase();
      const app = state.applications[fromKey].find((a) => a.id === applicationId);
      if (!app) return state;
      return {
        ...state,
        applications: {
          ...state.applications,
          [fromKey]: state.applications[fromKey].filter((a) => a.id !== applicationId),
          [toKey]: [...state.applications[toKey], { ...app, status: toStatus }],
        },
      };
    }

    case ActionTypes.ADD_DOCUMENT:
      return {
        ...state,
        documents: [...state.documents, { id: Date.now().toString(), ...action.payload }],
      };

    case ActionTypes.DELETE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter((doc) => doc.id !== action.payload),
      };

    case ActionTypes.UPDATE_STREAK:
      return {
        ...state,
        streakData: { ...state.streakData, ...action.payload },
      };

    default:
      return state;
  }
}

/* ── Context ── */
const AppContext = createContext();

/* ── Provider ── */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = useCallback((userData) => {
    dispatch({ type: ActionTypes.LOGIN, payload: userData });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: ActionTypes.LOGOUT });
  }, []);

  const updateProfile = useCallback((updates) => {
    dispatch({ type: ActionTypes.UPDATE_PROFILE, payload: updates });
  }, []);

  const completeOnboarding = useCallback(() => {
    dispatch({ type: ActionTypes.COMPLETE_ONBOARDING });
  }, []);

  const completeProfile = useCallback((profileData) => {
    dispatch({ type: ActionTypes.COMPLETE_PROFILE, payload: profileData });
  }, []);

  const toggleSave = useCallback((opportunityId) => {
    dispatch({ type: ActionTypes.TOGGLE_SAVE, payload: opportunityId });
  }, []);

  const addNotification = useCallback((notification) => {
    dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
  }, []);

  const markNotificationRead = useCallback((notificationId) => {
    dispatch({ type: ActionTypes.MARK_NOTIFICATION_READ, payload: notificationId });
  }, []);

  const updateApplication = useCallback((status, application) => {
    dispatch({ type: ActionTypes.UPDATE_APPLICATION, payload: { status, application } });
  }, []);

  const moveApplication = useCallback((applicationId, fromStatus, toStatus) => {
    dispatch({
      type: ActionTypes.MOVE_APPLICATION,
      payload: { applicationId, fromStatus, toStatus },
    });
  }, []);

  const addDocument = useCallback((document) => {
    dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: document });
  }, []);

  const deleteDocument = useCallback((documentId) => {
    dispatch({ type: ActionTypes.DELETE_DOCUMENT, payload: documentId });
  }, []);

  const updateStreak = useCallback((streakUpdates) => {
    dispatch({ type: ActionTypes.UPDATE_STREAK, payload: streakUpdates });
  }, []);

  const value = {
    ...state,
    login,
    logout,
    updateProfile,
    completeOnboarding,
    completeProfile,
    toggleSave,
    addNotification,
    markNotificationRead,
    updateApplication,
    moveApplication,
    addDocument,
    deleteDocument,
    updateStreak,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* ── Hook ── */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
