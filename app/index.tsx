import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, Href, useRouter, router, usePathname } from "expo-router";
import { GlobalState, IsUserRegisteredAsync, LogInUserAsync, LogoutUserAsync, SignUpUserAsync } from "../GlobalState";
import { StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { fetchMatchedUserID } from "./helpers/matchHelper";
import { Storage } from "./helpers/storageHelper";


require("../assets/images/matchAnimation.gif");
require("../assets/images/TheCatchLogo.png");
require("../assets/images/TheCatchText.png");

export default function Index() {
  // const router = useRouter();
  const pathname = usePathname();

  const [inputUsername, setInputUsername] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [inputConfirmPassword, setInputConfirmPassword] = useState<string>("");

  // State to manage if the user is signing in or signing up
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Create an Animated value to handle the height change
  const animatedHeight = useState(new Animated.Value(465))[0]; // Start at 465px height

  const handleUserMatch = async () => {
    const isRegistered = await IsUserRegisteredAsync(GlobalState.username);
    const matchedUserID = await fetchMatchedUserID(GlobalState.userID);

    // await Storage.setItem("alertShown", "false");

    if (!isRegistered) {
      router.push('/registration');
    }
    else if (matchedUserID) {
      GlobalState.isMatched = true;
      
      if (GlobalState.isMatching) {
        console.log("UNMATCHED: user is matching, so won't redirect");
        return;
      }

      // const alertShown = await Storage.getItem("alertShown");

      // if (!alertShown || alertShown !== "true") {
      //     // Alert.alert("Wooo", "You have a match!");
      //     await Storage.setItem("alertShown", "true");
      // }
      console.log("Index routing to Landing Page");
      router.push("/LandingPage");
    }
    else  {
      console.log("Index routing to Unmatched Page")
      router.push('/unmatched');
    }
    return;
  };

  const handleSignIn = async () => {
    if (!inputUsername || !inputPassword) {
      Alert.alert("Error", "Please enter a username and password.");
      return;
    }
    try {
      const [errorCode, username, isRegistered] = await LogInUserAsync(
        inputUsername.trim(),
        inputPassword
      );

      if (errorCode === 0 && username) {
        // Alert.alert(
        //   "Welcome",
        //   `User ${username} signed in successfully!${
        //     isRegistered ? "" : "\n However, you still need to register."
        //   }`
        // );
        if (isRegistered) {
          await handleUserMatch();
        } else {
          router.push("/registration");
        }
      } else if (errorCode === -1) {
        Alert.alert("Error", "Username or password is incorrect.");
      } else {
        Alert.alert("Error", "Failed to sign in.");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Toggle function to expand or collapse the white rectangle
  const handleSignInPress = async () => {
    if (GlobalState.isUserSignedIn) {
      await handleUserMatch();
    }

    setIsSigningIn(true);
    setIsSigningUp(false);
    // Animate the height change
    Animated.timing(animatedHeight, {
      toValue: 615, // Toggle between 465px and 615px
      duration: 500, // Animation duration (in milliseconds)
      useNativeDriver: false,
    }).start();
  };

  const handleSignUp = async () => {
    await LogoutUserAsync();
    if (!inputUsername || !inputPassword || !inputConfirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    if (inputPassword !== inputConfirmPassword) {
      Alert.alert("Error", "Passwords Must Match.");
      return;
    }

    if (inputPassword.length < 6 || inputConfirmPassword.length < 6) {
      Alert.alert("Error", "Passwords Must Be At Least 6 Characters.");
      return;
    }

    try {
      const [errorCode, username] = await SignUpUserAsync(
        inputUsername.trim(),
        inputPassword
      );

      if (errorCode === 0 && username) {
        // Alert.alert(
        //   "Success",
        //   `User ${username} account created successfully!`
        // );
        router.push("/registration");
      } else if (errorCode === -1) {
        Alert.alert("Error", "User already exists");
      } else {
        Alert.alert("Error", "Failed to sign up");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      Alert.alert("Error", "Failed to sign up");
    }
  };

  // Toggle function to expand or collapse the white rectangle
  const handleSignUpPress = async () => {
    await LogoutUserAsync();
    setIsSigningUp(true);
    setIsSigningIn(false);
    // Animate the height change
    Animated.timing(animatedHeight, {
      toValue: 665, // Toggle between 465px and 665px
      duration: 500, // Animation duration (in milliseconds)
      useNativeDriver: false,
    }).start();
  };

  // Clear state on load
  useEffect(() => {
    if (pathname === "/" || pathname === "/index") {
      setInputUsername("");
      setInputPassword("");
      setInputConfirmPassword("");
      setIsSigningUp(false);
      setIsSigningIn(false);
      Animated.timing(animatedHeight, {
        toValue: 465, // Toggle between 465px and 665px
        duration: 0, // Animation duration (in milliseconds)
        useNativeDriver: false,
      }).start();
    }
  }, [pathname]);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={styles.background}
    >
      <Animated.View // white rectangle (no absolute positioning now)
        style={{
          height: animatedHeight,
          backgroundColor: "white",
          borderRadius: 15,
          marginTop: 110, // Added a margin to space it from the top
        }}
      >
        {/* Top Section with welcome text and image */}
        <View style={{ alignItems: "center", paddingTop: 30 }}>
          <Text style={styles.bigText}>Welcome to</Text>

          <Image
            style={styles.logoImage}
            source={GlobalState.appNameImage}
          />
        </View>

        {/*Username and password entry*/}
        {(isSigningIn || isSigningUp) && (
          <View style={styles.inputContainer}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.textField}
                placeholder="Username"
                placeholderTextColor={Colors.grayText}
                value={inputUsername}
                onChangeText={setInputUsername}
                autoCapitalize="none"
              />
              {isSigningIn && (
                <Text style={styles.italicText}>Forgot Username?</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.textField}
                placeholder="Password"
                placeholderTextColor={Colors.grayText}
                value={inputPassword}
                onChangeText={setInputPassword}
                secureTextEntry={true}
                onSubmitEditing={async () => { await handleSignIn(); }}
                submitBehavior={isSigningUp ? null : isSigningIn ? "submit" : null}
              />
              {isSigningIn && (
                <Text style={styles.italicText}>Forgot Password?</Text>
              )}
            </View>

            {/*Confirm password entry*/}
            {isSigningUp && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.textField}
                  placeholder="Confirm Password"
                  placeholderTextColor={Colors.grayText}
                  value={inputConfirmPassword}
                  onChangeText={setInputConfirmPassword}
                  secureTextEntry={true}
                />
              </View>
            )}
          </View>
        )}

        {/* Button container */}
        <View style={styles.buttonContainer}>
          {/* Sign In Button */}
          <TouchableOpacity
            style={{
              ...styles.button,
              ...(isSigningUp && styles.smallButton), // Manually merge styles
            }}
            onPress={
              !isSigningUp && isSigningIn ? async () => { await handleSignIn(); } : async () => { await handleSignInPress(); }
            }
          >
            <Text
              style={[styles.buttonText, isSigningUp && styles.smallButtonText]}
            >
              SIGN IN
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={{
              ...styles.button,
              ...(isSigningIn && styles.smallButton), // Manually merge styles
            }}
            onPress={
              !isSigningIn && isSigningUp ? async () => { await handleSignUp(); } : async () => { await handleSignUpPress(); }
            }
          >
            <Text
              style={[styles.buttonText, isSigningIn && styles.smallButtonText]}
            >
              SIGN UP
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Logo Image */}
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Image
          style={styles.heartImage}
          source={GlobalState.appLogo}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.pink,
    // paddingHorizontal: "5%",
    padding: "5%",
  },
  inputContainer: {
    backgroundColor: "white",
    paddingTop: 20,
    marginBottom: -15,
    borderRadius: 15,
  },
  inputGroup: {
    width: "87.5%",
    alignSelf: "center",
    marginBottom: 10,
  },
  textField: {
    backgroundColor: Colors.grayCell,
    width: "100%",
    height: 50,
    borderRadius: 15,
    marginBottom: 20,
    fontSize: 18,
    color: Colors.grayText,
    padding: 10,
    textAlign: "left",
    // alignSelf: "center",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: "5%",
    justifyContent: "center",
    rowGap: 15,
    alignSelf: "center",
    marginTop: -25,
  },
  button: {
    backgroundColor: Colors.darkPurple,
    width: 225,
    height: 70,
    borderRadius: 15,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5, // Added for Android compatibility
  },
  smallButton: {
    width: 225 * 0.7,
    height: 70 * 0.7,
    alignSelf: "center",
  },
  bigText: {
    fontSize: 54,
    fontFamily: "Kurale_400Regular",
  },
  italicText: {
    color: Colors.grayText,
    fontStyle: "italic",
    alignSelf: "flex-start",
    paddingLeft: 20,
    paddingBottom: 15,
    marginTop: -10,
  },
  buttonText: {
    color: "white",
    fontSize: 35,
    fontFamily: "Kurale_400Regular",
  },
  smallButtonText: {
    fontSize: 35 * 0.7,
  },
  logoImage: {
    width: 325,
    height: 100,
  },
  heartImage: {
    width: 200,
    height: 200,
  },
});
