import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Button,
  Pressable,
  Dimensions,
} from "react-native";

import React, { useEffect, useState } from "react";
import { router } from "expo-router";

import { Colors } from "@/constants/Colors";
import { GlobalState } from "@/GlobalState";

// const gif = "../assets/images/matchAnimation.gif";

export default function matched() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleGifFinish = () => {
      GlobalState.isMatching = false;
      GlobalState.isMatched = true;
      // router.push("/LandingPage");
      router.replace("/LandingPage");
    };

    let timer: NodeJS.Timeout | null = null;

    const handleLoadEnd = () => {
      timer = setTimeout(handleGifFinish, 2200); // Gif is about 2 sec long
    };

    handleLoadEnd();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <View
      style={[
        styles.background,
        { flex: 1, alignContent: "center", alignItems: "center" },
      ]}
    >
      <Image
        source={GlobalState.matchAnimation}
        style={styles.gif}
        onLoadEnd={() => {setIsLoaded(true);}}
      ></Image>
      <Text style={styles.matchText}>MATCHED</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.pink,
    padding: "5%",
    flex: 1,
  },
  matchText: {
    color: Colors.darkRed,
    fontSize: 56,
    fontFamily: "Kurale_400Regular",
  },
  gif: {
    overlayColor: Colors.darkRed,
    resizeMode: "contain",
    tintColor: null,
  }
});
