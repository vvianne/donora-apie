export const COLORS = {
  primary: "#F04452",
  primaryDark: "#D7263D",
  background: "#F8F9FC",
  card: "#FFFFFF",
  secondary: "#FFECEE",
  success: "#12B76A",
  warning: "#F79009",
  text: "#1D2939",
  subtitle: "#667085",
  border: "#EAECF0",
  surfaceMuted: "#F2F4F7",
  info: "#2E90FA",
  danger: "#D92D20",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  screenPadding: 24,
  sectionGap: 24,
  cardPadding: 20,
  cardRadius: 20,
  buttonRadius: 14,
  inputRadius: 14,
};

export const SHADOWS = {
  card: {
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

export const STATUS_COLORS = {
  pending: { background: "#FFF7E6", foreground: "#B54708", dot: "#F79009" },
  approved: { background: "#EFF4FF", foreground: "#175CD3", dot: "#2E90FA" },
  in_progress: { background: "#EFF8FF", foreground: "#026AA2", dot: "#0BA5EC" },
  transporting: { background: "#F4F3FF", foreground: "#5925DC", dot: "#7F56D9" },
  completed: { background: "#ECFDF3", foreground: "#027A48", dot: "#12B76A" },
  rejected: { background: "#FEF3F2", foreground: "#B42318", dot: "#F04438" },
  cancelled: { background: "#F2F4F7", foreground: "#475467", dot: "#98A2B3" },
};

// Single source of truth for bottom navigation items.
// route must match the screen name registered in the Navigator (see App.js).
export const NAV_ITEMS = [
  { id: "home", route: "Home", label: "Home", icon: "home" },
  { id: "nearby", route: "Nearby", label: "Nearby", icon: "location" },
  { id: "history", route: "History", label: "History", icon: "document-text" },
  { id: "profile", route: "Profile", label: "Profile", icon: "person" },
];
