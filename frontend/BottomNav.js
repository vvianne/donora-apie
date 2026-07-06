import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, SPACING, NAV_ITEMS } from "./theme";

const BottomNav = ({ state, navigation }) => {
  const activeRouteName = state.routes[state.index].name;

  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeRouteName === item.route;

        return (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.route)}
          >
            <Ionicons
              name={isActive ? item.icon : `${item.icon}-outline`}
              size={22}
              color={isActive ? COLORS.primary : COLORS.subtitle}
            />
            <Text
              style={[
                styles.navLabel,
                isActive && {
                  color: COLORS.primary,
                  fontFamily: "Poppins_600SemiBold",
                },
              ]}
            >
              {item.label}
            </Text>
            {isActive && <View style={styles.navActiveDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    paddingHorizontal: SPACING.screenPadding,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  navLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
  },

  navActiveDot: {
    position: "absolute",
    top: -12,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});
