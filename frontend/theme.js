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
};

export const SPACING = {
  screenPadding: 24,
  sectionGap: 24,
  cardPadding: 20,
  cardRadius: 24,
  buttonRadius: 18,
  inputRadius: 16,
};

// Single source of truth for bottom navigation items.
// route must match the screen name registered in the Navigator (see App.js).
export const NAV_ITEMS = [
  { id: "home", route: "Home", label: "Home", icon: "home" },
  { id: "nearby", route: "Nearby", label: "Nearby", icon: "location" },
  { id: "history", route: "History", label: "History", icon: "document-text" },
  { id: "profile", route: "Profile", label: "Profile", icon: "person" },
];
