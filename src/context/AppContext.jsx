import { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import * as api from '../services/api';

/* ── Initial State ── */
const initialState = {
  user: null,
  auth: {
    isAuthenticated: false,
    hasCompletedOnboarding: false,
    hasCompletedProfile: false,
  },
  savedOpportunities: [],
  notifications: [],
  applications: {},
  documents: [],
  streakData: {
    currentStreakCount: 0,
    longestStreakCount: 0,
    goalHoursPerDay: 1,
    goalDaysOfWeek: '["Mon","Tue","Wed","Thu","Fri"]',
    logs: [],
  },
};

/* ── Action Types ── */
const ActionTypes = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  COMPLETE_ONBOARDING: 'COMPLETE_ONBOARDING',
  COMPLETE_PROFILE: 'COMPLETE_PROFILE',
  TOGGLE_SAVE: 'TOGGLE_SAVE',
  SET_SAVED: 'SET_SAVED',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  SET_APPLICATIONS: 'SET_APPLICATIONS',
  UPDATE_APPLICATION: 'UPDATE_APPLICATION',
  MOVE_APPLICATION: 'MOVE_APPLICATION',
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',
  SET_STREAK: 'SET_STREAK',
  UPDATE_STREAK: 'UPDATE_STREAK',
};

/* ── Reducer ── */
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.LOGIN:
      return {
        ...state,
        auth: { ...state.auth, isAuthenticated: true },
        user: action.payload,
      };

    case ActionTypes.LOGOUT:
      return { ...initialState };

    case ActionTypes.SET_USER:
      return { ...state, user: { ...state.user, ...action.payload } };

    case ActionTypes.UPDATE_PROFILE:
      return { ...state, user: { ...state.user, ...action.payload } };

    case ActionTypes.COMPLETE_ONBOARDING:
      return { ...state, auth: { ...state.auth, hasCompletedOnboarding: true } };

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

    case ActionTypes.SET_SAVED:
      return { ...state, savedOpportunities: action.payload };

    case ActionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          { id: Date.now().toString(), read: false, timestamp: new Date().toISOString(), ...action.payload },
          ...state.notifications,
        ],
      };

    case ActionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true, isRead: true } : n
        ),
      };

    case ActionTypes.SET_APPLICATIONS:
      return { ...state, applications: action.payload };

    case ActionTypes.UPDATE_APPLICATION: {
      const { status, application } = action.payload;
      const key = status.toLowerCase();
      return {
        ...state,
        applications: {
          ...state.applications,
          [key]: (state.applications[key] || []).map((app) =>
            app.id === application.id ? { ...app, ...application } : app
          ),
        },
      };
    }

    case ActionTypes.MOVE_APPLICATION: {
      const { applicationId, fromStatus, toStatus } = action.payload;
      const fromKey = fromStatus.toLowerCase();
      const toKey = toStatus.toLowerCase();
      const app = (state.applications[fromKey] || []).find((a) => a.id === applicationId);
      if (!app) return state;
      return {
        ...state,
        applications: {
          ...state.applications,
          [fromKey]: (state.applications[fromKey] || []).filter((a) => a.id !== applicationId),
          [toKey]: [...(state.applications[toKey] || []), { ...app, applicationStatus: toStatus }],
        },
      };
    }

    case ActionTypes.SET_DOCUMENTS:
      return { ...state, documents: action.payload };

    case ActionTypes.ADD_DOCUMENT:
      return { ...state, documents: [...state.documents, action.payload] };

    case ActionTypes.DELETE_DOCUMENT:
      return { ...state, documents: state.documents.filter((doc) => doc.id !== action.payload) };

    case ActionTypes.SET_STREAK:
      return { ...state, streakData: action.payload };

    case ActionTypes.UPDATE_STREAK:
      return { ...state, streakData: { ...state.streakData, ...action.payload } };

    default:
      return state;
  }
}

/* ── Context ── */
const AppContext = createContext();

/* ── Provider ── */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [authLoading, setAuthLoading] = useState(true);

  /* ── Restore session on mount ── */
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    api.users.getProfile()
      .then((userData) => {
        dispatch({ type: ActionTypes.LOGIN, payload: userData });
        // Load saved items
        api.opportunities.getSaved().then((saved) => {
          const ids = (saved || []).map((s) => s.itemId || s.id);
          dispatch({ type: ActionTypes.SET_SAVED, payload: ids });
        }).catch(() => {});
      })
      .catch(() => {
        api.clearToken();
      })
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Auth Actions ── */
  const login = useCallback(async (email, password) => {
    const res = await api.auth.login(email, password);
    api.setToken(res.token);
    const profile = await api.users.getProfile();
    dispatch({ type: ActionTypes.LOGIN, payload: profile });
    return profile;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.auth.register(data);
    api.setToken(res.token);
    const profile = await api.users.getProfile();
    dispatch({ type: ActionTypes.LOGIN, payload: profile });
    return profile;
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    dispatch({ type: ActionTypes.LOGOUT });
  }, []);

  /* ── Profile Actions ── */
  const updateProfile = useCallback(async (updates) => {
    try {
      await api.onboarding.updateProfile(updates);
    } catch (e) {
      // Allow local-only updates for fields the backend doesn't have
    }
    dispatch({ type: ActionTypes.UPDATE_PROFILE, payload: updates });
  }, []);

  const completeOnboarding = useCallback(async () => {
    try { await api.onboarding.complete(); } catch (e) { /* ok */ }
    dispatch({ type: ActionTypes.COMPLETE_ONBOARDING });
  }, []);

  const completeProfile = useCallback(async (profileData) => {
    try {
      await api.onboarding.updateProfile(profileData);
    } catch (e) { /* ok */ }
    dispatch({ type: ActionTypes.COMPLETE_PROFILE, payload: profileData });
  }, []);

  /* ── Save/Bookmark ── */
  const toggleSave = useCallback(async (opportunityId) => {
    const isSaved = state.savedOpportunities.includes(opportunityId);
    dispatch({ type: ActionTypes.TOGGLE_SAVE, payload: opportunityId });
    try {
      if (isSaved) {
        await api.opportunities.unsave(opportunityId);
      } else {
        await api.opportunities.save(opportunityId);
      }
    } catch (e) {
      // Revert on failure
      dispatch({ type: ActionTypes.TOGGLE_SAVE, payload: opportunityId });
    }
  }, [state.savedOpportunities]);

  /* ── Notifications ── */
  const addNotification = useCallback((notification) => {
    dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
  }, []);

  const markNotificationRead = useCallback(async (notificationId) => {
    dispatch({ type: ActionTypes.MARK_NOTIFICATION_READ, payload: notificationId });
    try { await api.notifications.markRead(notificationId); } catch (e) { /* ok */ }
  }, []);

  /* ── Applications ── */
  const updateApplication = useCallback(async (status, application) => {
    dispatch({ type: ActionTypes.UPDATE_APPLICATION, payload: { status, application } });
    try { await api.applications.update(application.id, application); } catch (e) { /* ok */ }
  }, []);

  const moveApplication = useCallback(async (applicationId, fromStatus, toStatus) => {
    dispatch({ type: ActionTypes.MOVE_APPLICATION, payload: { applicationId, fromStatus, toStatus } });
    try { await api.applications.update(applicationId, { applicationStatus: toStatus }); } catch (e) { /* ok */ }
  }, []);

  /* ── Documents ── */
  const addDocument = useCallback(async (document) => {
    try {
      const created = await api.documents.upload(document);
      dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: created });
      return created;
    } catch (e) {
      dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: { id: Date.now().toString(), ...document } });
    }
  }, []);

  const deleteDocument = useCallback(async (documentId) => {
    dispatch({ type: ActionTypes.DELETE_DOCUMENT, payload: documentId });
    try { await api.documents.delete(documentId); } catch (e) { /* ok */ }
  }, []);

  /* ── Streak ── */
  const updateStreak = useCallback((streakUpdates) => {
    dispatch({ type: ActionTypes.UPDATE_STREAK, payload: streakUpdates });
  }, []);

  const value = {
    ...state,
    authLoading,
    login,
    register,
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
