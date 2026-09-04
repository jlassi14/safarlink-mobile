import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

export const AuthLogoHeader: React.FC = () => {
  return (
    <View style={styles.logoSection}>
      <View style={styles.logoGlowWrapper}>
        <Svg height="200" width="440" style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="unifiedAuthLogoGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.30" />
              <Stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.10" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#unifiedAuthLogoGlow)" />
        </Svg>
        <Image
          source={require("../public/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 4,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    height: 180,
  },
  logoGlowWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 440,
    height: 180,
  },
  logoImage: {
    width: 200,
    height: 110,
  },
});

export default AuthLogoHeader;
