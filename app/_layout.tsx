import { Link, Stack, useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  Alert,
  View,
  Image,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Kurale_400Regular } from "@expo-google-fonts/kurale";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  ClearGlobalState,
  ClearGlobalStateMatchData,
  GlobalState,
  IsUserRegisteredAsync,
  listenToAuthChanges,
  LogInUserAsync,
  LogInUserAuthAsync,
  LogoutUserAsync,
} from "@/GlobalState";
import { LeavingEditScreenAlert } from "./components/formComponents";
import { fetchMatchedUserID } from "./helpers/matchHelper";
import { profileStyles } from "@/styles/profileStyles";
import { Storage } from "./helpers/storageHelper";
import { Colors } from "@/constants/Colors";
import { BlurView } from "expo-blur";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseConfig";

// Prevent splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  const handleLogin = async (user: any) => {
    console.log("Rehydrating user state...");
    await LogInUserAuthAsync(user);

    try {
      const isRegistered = await IsUserRegisteredAsync(GlobalState.username);
      const matchedUserID = await fetchMatchedUserID(GlobalState.userID);

      if (!isRegistered) {
        router.push("/registration");
      } else if (matchedUserID) {
        GlobalState.isMatched = true;
        // const alertShown = await Storage.getItem("alertShown");
        // if (!alertShown || alertShown !== "true") {
        //   await Storage.setItem("alertShown", "true");
        // }
        if (GlobalState.isMatching) {
          console.log("_layout noticed user is matching");
        }
        console.log("_layout routing to LandingPage");
        router.push("/LandingPage");
      } else {
        ClearGlobalStateMatchData();
        console.log("_layout routing to unmatched");
        router.push("/unmatched");
      }
    } catch (error) {
      console.error("Error during navigation logic:", error);
    }
  };

  const handleLogout = async () => {
    console.log("Session expired. Logging out user...");
    await LogoutUserAsync();
    router.push("/");
  };

  // When user is editing registration and tries to hit the back button
  const handleRegistrationBackPress = async (navigation) => {
    // LeavingEditScreenAlert({
    //   onConfirm: async () => {
    //     GlobalState.isEditingProfile = false;
    //     await LogoutUserAsync();
    //     navigation.goBack();
    //   },
    //   elseFunc: () => navigation.goBack(),
    //   messageHeader: "Unsaved Account",
    //   messageBody:
    //     "Your account is incomplete. Are you sure you want to continue?\n You still need to register.",
    // });
    GlobalState.isEditingProfile = false;
    await LogoutUserAsync();
    navigation.goBack();
  };

  // When user is editing profile and tries to hit the back button
  const handleProfileBackPress = (navigation) => {
    LeavingEditScreenAlert({
      condition: GlobalState.isEditingProfile,
      onConfirm: async () => {
        GlobalState.isEditingProfile = false;
        const isRegistered = await IsUserRegisteredAsync(GlobalState.username);
        const matchedUserID = await fetchMatchedUserID(GlobalState.userID);
        if (!isRegistered) {
          router.push("/registration");
        } else if (matchedUserID) {
          console.log("A ** PROFILE BACK LAYOUT: ismatched TRUE");
          GlobalState.isMatched = true;
          // const alertShown = await Storage.getItem("alertShown");
          // if (!alertShown || alertShown !== "true") {
          //   await Storage.setItem("alertShown", "true");
          // }
          if (GlobalState.isMatching) {
            console.log("A ** _layout noticed user is matching");
          }
          navigation.reset({
            index: 1,
            routes: [
              { name: "LandingPage" }, // Place LandingPage below
              { name: "ProfilePage" }, // Current screen
            ],
          });

          // Go back to LandingPage with back animation
          navigation.goBack();
          // router.push("/LandingPage");
          // navigation.replace("LandingPage");
        } else {
          console.log("PROFILE BACK LAYOUT: ismatched FALSE");
          ClearGlobalStateMatchData();
          navigation.reset({
            index: 1,
            routes: [
              { name: "unmatched" }, // Place Unmatched below
              { name: "ProfilePage" }, // Current screen
            ],
          });

          // Go back to Unmatched with back animation
          navigation.goBack();
          // router.push('/unmatched');
          // navigation.replace("unmatched");
        }
      },
      elseFunc: async () => {
        GlobalState.isEditingProfile = false;
        const isRegistered = await IsUserRegisteredAsync(GlobalState.username);
        const matchedUserID = await fetchMatchedUserID(GlobalState.userID);
        if (!isRegistered) {
          router.push("/registration");
        } else if (matchedUserID) {
          console.log("B ** PROFILE BACK LAYOUT: ismatched TRUE");
          GlobalState.isMatched = true;
          // const alertShown = await Storage.getItem("alertShown");
          // if (!alertShown || alertShown !== "true") {
          //   await Storage.setItem("alertShown", "true");
          // }
          if (GlobalState.isMatching) {
            console.log("_layout noticed user is matching");
          }

          // Add LandingPage to the stack below the current screen
          navigation.reset({
            index: 1,
            routes: [
              { name: "LandingPage" }, // Place LandingPage below
              { name: "ProfilePage" }, // Current screen
            ],
          });

          // Go back to LandingPage with back animation
          navigation.goBack();
          // router.push("/LandingPage");
        } else {
          console.log("B ** PROFILE BACK LAYOUT: ismatched FALSE");
          ClearGlobalStateMatchData();
          // This is how to get a back animation:

          // Add Unmatched to the stack below the current screen
          navigation.reset({
            index: 1,
            routes: [
              { name: "unmatched" }, // Place Unmatched below
              { name: "ProfilePage" }, // Current screen
            ],
          });

          // Go back to Unmatched with back animation
          navigation.goBack();

          // router.push('/unmatched');
        }
      },
    });
  };

  // When user is editing profile and tries to press the Settings button
  const handleProfileSettingsPress = (navigation) => {
    LeavingEditScreenAlert({
      condition: GlobalState.isEditingProfile,
      onConfirm: async () => {
        GlobalState.isEditingProfile = false;
        navigation.navigate("Settings");
      },
      elseFunc: () => navigation.navigate("Settings"),
    });
  };

  // No longer needed due to the landing page having listeners to the db
  // const handleChatBackPress = (navigation) => {
  //   // mimic back press:
  //   // Add LandingPage to the stack below the current screen
  //   navigation.reset({
  //     index: 1,
  //     routes: [
  //       { name: "LandingPage" }, // Place LandingPage below
  //       { name: "Chat" }, // Current screen
  //     ],
  //   });

  //   // Go back to Unmatched with back animation
  //   navigation.goBack();
  // };

  // const [isMatchProfilePicRevealed, setIsMatchProfilePicRevealed] = useState(false);

  // useEffect(() => {
  //   const checkMatchProfilePicRevealed = () => {
  //     setIsMatchProfilePicRevealed(GlobalState.isMatchProfilePicRevealed);
  //   };

  //   checkMatchProfilePicRevealed();

  //   const interval = setInterval(checkMatchProfilePicRevealed, 100);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges(handleLogin, handleLogout);

    return () => {
      if (unsubscribe) unsubscribe(); // Clean up the listener
    };
  }, []);

  const [fontsLoaded] = useFonts({
    Kurale_400Regular,
  });

  // Show splash screen until fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Prevent rendering until fonts are loaded
  }

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontSize: 30,
          fontFamily: "Kurale_400Regular", // Global font for all headers
        },
        headerTintColor: "black", // Make the back button black
        contentStyle: { backgroundColor: Colors.pink },
      }}
    >
      <Stack.Screen
        name="LandingPage"
        options={({ navigation }) => ({
          title: "The Catch",
          headerBackVisible: false,
          gestureEnabled: false,
          headerRight: () => (
            <Pressable onPress={() => router.push("/ProfilePage")}>
              <Feather name="user" size={28} color="black" />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="unmatched"
        options={({ navigation }) => ({
          title: "The Catch",
          headerBackVisible: false,
          gestureEnabled: false,
          headerRight: () => (
            <Pressable onPress={() => router.push("/ProfilePage")}>
              <Feather name="user" size={28} color="black" />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="matched"
        options={({ navigation }) => ({
          title: "",
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="report"
        options={{
          headerShown: true,
          title: "Report User",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="matchPreferences"
        options={({ navigation }) => ({
          title: "Preferences",
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () =>
            !GlobalState.isRegistering && (
              <View style={{ marginLeft: -15 }}>
                <Pressable
                  onPress={() => {
                    navigation.goBack();
                  }}
                >
                  <Feather name="chevron-left" size={32} color="black" />
                </Pressable>
              </View>
            ),
        })}
      />
      <Stack.Screen
        name="changeUserPass"
        options={{
          title: "Change Password",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="deleteAccount"
        options={{
          title: "Delete Account",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="registration"
        options={({ navigation }) => ({
          title: "Register",
          headerBackVisible: false,
          //   headerBackButtonDisplayMode: "minimal",
          gestureEnabled: false,
          headerLeft: () => (
            <View style={{ marginLeft: -15 }}>
              <Pressable
                onPress={async () => {
                  await handleRegistrationBackPress(navigation);
                }}
              >
                <Feather name="chevron-left" size={32} color="black" />
              </Pressable>
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="breakup"
        options={{
          title: "Break Up :(",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="ProfilePage"
        options={({ navigation }) => ({
          title: "Profile",
          gestureEnabled: false,
          headerBackVisible: false,
          // headerBackButtonDisplayMode: "minimal",
          headerLeft: () => (
            <View style={{ marginLeft: -15 }}>
              <Pressable onPress={() => handleProfileBackPress(navigation)}>
                <Feather name="chevron-left" size={32} color="black" />
              </Pressable>
            </View>
          ),
          headerRight: () => (
            <Pressable onPress={() => handleProfileSettingsPress(navigation)}>
              <Feather name="settings" size={28} color="black" />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="Chat"
        options={({ navigation }) => ({
          title: "Chat",
          gestureEnabled: false,
          // headerBackVisible: false,
          headerBackButtonDisplayMode: "minimal",
          // headerLeft: () => (
          //   <View style={{ marginLeft: -15 }}>
          //     <Pressable onPress={() => handleChatBackPress(navigation)}>
          //       <Feather name="chevron-left" size={32} color="black" />
          //     </Pressable>
          //   </View>
          // ),

          // Now in a useLayoutEffect in the chat screen for live updates
          // headerRight: () => (
          //   <Pressable onPress={() => navigation.goBack()}>
          //     <View
          //       style={[
          //         profileStyles.iconImage,
          //         isMatchProfilePicRevealed && profileStyles.blurredPhoto,
          //       ]}
          //     >
          //       {isMatchProfilePicRevealed && GlobalState.matchProfilePic && GlobalState.matchProfilePic.length > 0 ? (
          //         <Image
          //           source={{ uri: GlobalState.matchProfilePic }}
          //           style={profileStyles.iconImage}
          //         />
          //       ) : (
          //         <Image
          //           source={require("../assets/images/BlankProfilePic.png")}
          //           style={profileStyles.iconImage}
          //         />
          //       )}
          //       {!isMatchProfilePicRevealed && (
          //         <View style={StyleSheet.absoluteFill}>
          //           <BlurView style={[StyleSheet.absoluteFill, profileStyles.iconblurBox, profileStyles.iconblur, profileStyles.iconImage]} intensity={5} tint="light">
          //             <Ionicons name="help" size={24} color="black" />
          //           </BlurView>
          //         </View>
          //       )}
          //     </View>
          //       </Pressable>
          //     ),
        })}
      />

      <Stack.Screen
        name="Settings"
        options={{
          title: "Settings",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
