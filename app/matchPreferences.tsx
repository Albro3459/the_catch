import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Pressable, Alert } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Colors } from "@/constants/Colors";
import { profileStyles } from "@/styles/profileStyles";
import { ClearGlobalStateMatchData, GlobalState } from "@/GlobalState";
import { fetchMatchedUserID } from "./helpers/matchHelper";
import { router } from "expo-router";
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import WhiteCheckSVG from "../assets/images/WhiteCheckSVG.svg"

const screenWidth = Dimensions.get("window").width;
const scale = 0.5;

const magenta = "#FF2452";

export default function matchPreferences() {
  const [gender, setGender] = useState("Everyone");
  const [ageRange, setAgeRange] = useState([18, 26]);

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
  };

  const handleAgeRangeChange = (values) => {
    setAgeRange(values);
  };

  const handleUserRedirect = async () => {
    const matchedUserID = await fetchMatchedUserID(GlobalState.userID);
    if (matchedUserID) {
      GlobalState.isMatched = true;

      if (GlobalState.isMatching) {
        console.log("UNMATCHED: user is matching, so won't redirect");
        return;
      }

      router.push("/LandingPage");
    }
    else  {
      ClearGlobalStateMatchData();
      router.push('/unmatched');
    }
    return;
  };


  const saveUserProfile = async () => {
    const userID = GlobalState.userID;

    if (!userID) {
      Alert.alert(
        "Error",
        "No user ID found in GlobalState. Cannot save changes."
      );
      return;
    }

    try {
      const userRef = doc(db, "Users", userID);

      // Update Firestore document
      await updateDoc(userRef, { isRegistered: true });

      // Alert.alert("Success", "Your profile has been created successfully.");

      GlobalState.isRegistered = true;
      GlobalState.isRegistering = false;

      await handleUserRedirect();

    } catch (error) {
      console.error("Error saving user profile:", error);
      Alert.alert("Error", "An error occurred while creating your profile.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Gender:</Text>
        <TouchableOpacity onPress={() => handleGenderSelect("Male")}>
          <View style={[styles.optionContainer, gender === "Male" && styles.selectedOptionContainer]}>
              <Text
                style={[
                  styles.option,
                  gender === "Male" && styles.selectedOption,
                ]}
              >
                Male
              </Text>
              {gender === "Male" && (
                <View style={styles.svgContainer}>
                  <WhiteCheckSVG width="125%" height="125%" />
                </View>
              )}
            </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleGenderSelect("Female")}>
          <View style={[styles.optionContainer, gender === "Female" && styles.selectedOptionContainer]}>
            <Text
              style={[
                styles.option,
                gender === "Female" && styles.selectedOption,
              ]}
            >
              Female
            </Text>
            {gender === "Female" && (
              <View style={styles.svgContainer}>
                <WhiteCheckSVG width="125%" height="125%" />
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleGenderSelect("Everyone")}>
          <View style={[styles.optionContainer, gender === "Everyone" && styles.selectedOptionContainer]}>
            <Text
              style={[
                styles.option,
                gender === "Everyone" && styles.selectedOption,
              ]}
            >
              Everyone
            </Text>
            {gender === "Everyone" && (
              <View style={styles.svgContainer}>
                <WhiteCheckSVG width="125%" height="125%" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={[profileStyles.separatorLine, {marginBottom: 20}]}></View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Age Range: {ageRange[0]} - {ageRange[1]}
        </Text>
        <MultiSlider
          values={ageRange}
          sliderLength={screenWidth*.75}
          onValuesChange={handleAgeRangeChange}
          min={18}
          max={82}
          step={1}
          snapped
          containerStyle={{paddingLeft: 8}}
          customMarker={() => (
          <View style={styles.heartContainer}>
            <View
              style={[styles.heartLeft, { backgroundColor: magenta }]}
            />
            <View
              style={[styles.heartRight, { backgroundColor: magenta }]}
            />
          </View>
          )}
          selectedStyle={styles.selectedRange}
          unselectedStyle={styles.unselectedRange}
        />
        <View style={styles.ageLabels}>
          {Array.from({ length: 9 }, (_, i) => (i === 0 ? 18 : 18 + i * 8)).map((age) => (
            <Text key={age} style={styles.ageLabel}>
              {age}
            </Text>
          ))}
        </View>
      </View>
        
      {GlobalState.isRegistering && (
        <View style={[profileStyles.buttonContainer, styles.bottomButtonContainer]}>
          <Pressable style={profileStyles.saveButton} onPress={saveUserProfile}>
            <Text style={profileStyles.buttonText}>Save</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 75,
    backgroundColor: Colors.pink,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 50, // Adjust as needed for spacing from the bottom
    left: 0,
    right: 0,
    alignItems: "center", // Center the button horizontally
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 24,
    fontFamily: "Kurale_400Regular",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)", // Shadow color
    textShadowOffset: { width: 0.5, height: 0.5 }, // Shadow position
    textShadowRadius: 1, // Shadow blur
  },
  option: {
    fontSize: 18,
    fontFamily: "Kurale_400Regular",
  },
  selectedOption: {
    // fontWeight: "bold", // font doesnt have a bold option
    fontSize: 20,
    color: "white",
    fontFamily: "Kurale_400Regular",
    textShadowColor: "rgba(0, 0, 0, 0.3)", // Shadow color
    textShadowOffset: { width: 0.5, height: 0.5 }, // Shadow position
    textShadowRadius: 1, // Shadow blur
  },
  optionContainer: {
    height: 50,
    backgroundColor: Colors.grayCell,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,.3)",
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  selectedOptionContainer: {
    height: 50,
    backgroundColor: Colors.darkPurple,
  },
  svgContainer: {
    width: 20,
    height: 20, 
    justifyContent: "center",
    alignItems: "center",
  },
  marker: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: Colors.darkPurple,
  },
  selectedRange: {
    // paddingLeft: 5,
    backgroundColor: magenta,
  },
  unselectedRange: {
    // marginLeft: 5,
    backgroundColor: Colors.pink,
  },
  ageLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ageLabel: {
    fontSize: 15,
  },
  heartContainer: {
    width: (screenWidth / 10) * scale,
    height: ((4 * screenWidth) / 50) * scale,
    justifyContent: "center",
    alignItems: "center",
  },
  heartLeft: {
    width: 0.079 * screenWidth * scale,
    height: (screenWidth / 20) * scale,
    backgroundColor: "#FDB0C0",
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    left: 0,
  },
  heartRight: {
    width: 0.079 * screenWidth * scale,
    height: (screenWidth / 20) * scale,
    backgroundColor: "#FDB0C0",
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    transform: [{ rotate: "-45deg" }],
    position: "absolute",
    right: 0,
  }
});
