import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Button,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";

import { router, usePathname } from "expo-router";

import React, { useState, useEffect, useRef } from "react";

import { Colors } from "@/constants/Colors";

import { createMatch, fetchMatchedUserID } from "./helpers/matchHelper";
import { ClearGlobalState, ClearGlobalStateMatchData, GlobalState, LogoutUserAsync } from "@/GlobalState";
import { Storage } from "./helpers/storageHelper";
import { Timer } from "./components/timerComponent";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseConfig";


enum DaysOfTheWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
};

// This is the day of the week the countdown will go to
const TargetMatchDate = DaysOfTheWeek.Monday;

export default function unmatched() {
  const pathname = usePathname();

  const getTargetDate = (): Date => {
    const now = new Date();
    const nextCountdown = new Date();
  
    // Calculate the next countdown
    const dayOfWeek = now.getDay();
    const hoursNow = now.getHours();
  
    nextCountdown.setDate(
      now.getDate() + ((TargetMatchDate - dayOfWeek + 7) % 7) + (dayOfWeek === TargetMatchDate && hoursNow >= 17 ? 7 : 0)
    );
    nextCountdown.setHours(17, 0, 0, 0);
  
    return nextCountdown;
  };

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [targetTime, setTargetTime] = useState<Date>(getTargetDate()); // Need this so date is loaded and not -1
  const [simulation, setSimulation] = useState<boolean>(false);

  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);

  const normalIntervalId = useRef<NodeJS.Timeout | null>(null);
  const simulationIntervalId = useRef<NodeJS.Timeout | null>(null);

  const handleUserMatch = async () => {
    const matchedUserID = await fetchMatchedUserID(GlobalState.userID);
    if (matchedUserID) {
      GlobalState.isMatched = true;

      if (GlobalState.isMatching) {
        console.log("UNMATCHED: user is matching, so won't redirect");
        return;
      }

      // const alertShown = await Storage.getItem("alertShown");

      // if (!alertShown || alertShown !== "true") {
      //   // Alert.alert("Wooo", "You have a match!");
      //   await Storage.setItem("alertShown", "true");
      // }
      
      // console.log("Found a match. Routing to landing page");
      // router.push("/LandingPage");
      console.log("Found a match on UNMATCHED. Routing to matched page");
      router.push("/matched");
    } 
    else {
      ClearGlobalStateMatchData();
      // router.push("/unmatched");
    }
  };

  const calculateTimeLeftAsDate = (target: Date): Date => {
    const difference = target.getTime() - new Date().getTime();
    return new Date(Date.now() + Math.max(0, difference)); // Ensure no negative dates
};

  // Calculate time left function
  const calculateTimeLeft = (target: Date) => {
    const difference = target.getTime() - new Date().getTime();
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const { days, hours, minutes, seconds } = calculateTimeLeft(targetTime);

  const resetCountdown = (): void => {
    setSimulation(false);
    const now = new Date();
    const nextCountdown = new Date();
  
    // Calculate the next countdown
    const dayOfWeek = now.getDay();
    const hoursNow = now.getHours();
  
    nextCountdown.setDate(
      now.getDate() + ((TargetMatchDate - dayOfWeek + 7) % 7) + (dayOfWeek === TargetMatchDate && hoursNow >= 17 ? 7 : 0)
    );
    nextCountdown.setHours(17, 0, 0, 0);
  
    setTargetTime(nextCountdown);
  };
  

  const getMatch = async () => {
    
    const success = await createMatch(GlobalState.userID, GlobalState.username);
    if (success) {
      GlobalState.isMatching = true;
      // router.push("/matched");
      router.replace("/matched");
    } else {
      Alert.alert(
        "Failure",
        "No users are available to match :(. \n Try again later."
      );
    }
  };

  const startNormalTimer = () => {
    clearAllIntervals(); // Ensure no timers are running
    normalIntervalId.current = setInterval(() => {
      resetCountdown();
      setCurrentTime(new Date());
    }, 1000);
  };

  const startSimulation = () => {
    clearAllIntervals();
    setSimulation(true);
    GlobalState.isSimulatingTimer = true;

    // Used to reduce time smoothly
    const targetDiff = targetTime.getTime() - new Date().getTime();
    const simulationDuration = 3000; // 1000 == 1 sec for the simulation
    const steps = 100;
    const intervalTime = simulationDuration / steps; // Time between updates
    const timeDecrement = targetDiff / steps; // Amount of time to decrement per step

    let currentDiff = targetDiff;

    simulationIntervalId.current = setInterval(async () => {
      currentDiff -= timeDecrement;
      const newTime = new Date(new Date().getTime() + currentDiff);

      if (currentDiff <= 0) {
        clearInterval(simulationIntervalId.current);
        setSimulation(false);

        await getMatch();

        // Resets the timer after 1.5 sec
        setTimeout(async() => {
            GlobalState.isSimulatingTimer = false;
            setTargetTime(calculateTimeLeftAsDate(targetTime));
        }, 1500);
      } else {
        setTargetTime(newTime);
      }
    }, intervalTime);
  };

  const clearAllIntervals = () => {
    if (normalIntervalId.current) {
      clearInterval(normalIntervalId.current);
      normalIntervalId.current = null;
    }
    if (simulationIntervalId.current) {
      clearInterval(simulationIntervalId.current);
      simulationIntervalId.current = null;
    }
  };

  const useUserMatchListener = (userID) => {
    const [isMatching, setIsMatching] = useState(false);
    

    // let unmatchedUnsubscribeUser;

    useEffect(() => {  
      const initialize = async () => {

        if (!userID ||
          !GlobalState.isUserSignedIn ||
          GlobalState.userID == "" ||
          GlobalState.username == ""
        ) {
          await LogoutUserAsync();
          ClearGlobalState();
          router.push("/");
          return;
        }

        if (pathname === "/unmatched" && !isMatching) {
          setIsMatching(true);
          await handleUserMatch(); // Handle matching logic
          startNormalTimer();
  
          // Firestore listener for user match
          const userRef = doc(db, "Users", userID);
          if (GlobalState.unmatchedUnsubscribeUser) {
            GlobalState.unmatchedUnsubscribeUser();
            GlobalState.unmatchedUnsubscribeUser = null;
            console.log("UnmatchedPage Match listener unsubscribed.");
          }
          GlobalState.unmatchedUnsubscribeUser = onSnapshot(
            userRef,
            { includeMetadataChanges: true },
            async (userSnapshot) => {
              if (userSnapshot.exists()) {
                if (!GlobalState.isUserSignedIn) {
                  console.log("Listener stopped: User is not signed in.");
                  if (GlobalState.landingPageUnsubscribeUser) GlobalState.landingPageUnsubscribeUser();
                  return;
                }
                if (userSnapshot.metadata.fromCache) {
                  console.log("UNMATCHED PAGE: Data is from cache; waiting for server data...");
                  return;
                }
                if (!userID ||
                  !GlobalState.isUserSignedIn ||
                  GlobalState.userID == "" ||
                  GlobalState.username == "" ||
                  pathname !== "/unmatched"
                ) {
                  await LogoutUserAsync();
                  ClearGlobalState();
                  router.push("/");
                  return;
                }
  
                const userData = userSnapshot.data();
  
                // Update global state
                GlobalState.userProfilePic = userData.profilePic;
                GlobalState.userPhotos = userData.photos;
                GlobalState.userVideo = userData.video;
  
                // Check if the user is matched and not in the matching animation
                console.log("User data snapshot UNMATCHED PAGE:", userData);
                if (userData.isMatched && !isMatching && GlobalState.isUserSignedIn) {
                  GlobalState.isMatched = true;
                  GlobalState.isMatching = false;
                  await handleUserMatch();
                }
              } else {
                console.error("User document not found!");
                await LogoutUserAsync();
              }
            },
            (error) => {
              console.error("Error listening to user updates:", error);
            }
          );
        }
      };
  
      initialize();
  
      // Cleanup listener on component unmount
      return () => {
        if (GlobalState.unmatchedUnsubscribeUser) {
          GlobalState.unmatchedUnsubscribeUser();
          console.log("Unmatched Page: Firestore listener unsubscribed.");
        }
        clearAllIntervals();
      };
    }, [pathname, userID]);
  
    return isMatching;
  };

  const isMatching = useUserMatchListener(GlobalState.userID);
  useEffect(() => {
    if (pathname !== "/unmatched") return;

    GlobalState.isMatching = isMatching;
  }, [isMatching]);

  return (
    <View style={[styles.background, { flex: 1 }]}>
      <View style={styles.container}>
        <Text style={styles.bigText}>Next Catch In:</Text>
        {days !== undefined && days !== null ? (
          <Timer 
            times={[days, hours, minutes, seconds]}>
          </Timer>
        ) : null}
        <Pressable
          style={[styles.checkInButton, isCheckedIn && styles.checkedInButton]}
          onPress={() => { startSimulation(); }}
        >
          <Text
            style={[
              styles.checkInButtonText,
              isCheckedIn && styles.checkedInText,
            ]}
          >
            Check in
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.yellowButton,
            { backgroundColor: "gold", paddingHorizontal: "5%" },
          ]}
        >
          <Text
            style={[
              styles.yellowButtonText,
              {
                color: "white",
                fontSize: 28,
              },
            ]}
          >
            Go Premium
          </Text>
        </Pressable>
        <Text style={[styles.smallText, { color: Colors.grayText }]}>
          Get Priority Matches
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.pink,
    padding: "5%",
  },
  container: {
    backgroundColor: "white",
    width: "100%",
    padding: "3%",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: "5%",
    marginTop: 50,
  },
  smallText: {
    fontSize: 15,
    padding: "1%",
    fontFamily: "Kurale_400Regular",
    paddingBottom: "10%",
  },
  bigText: {
    fontSize: 42,
    padding: "10%",
    fontFamily: "Kurale_400Regular",
  },
  countdown: {
    fontSize: 46,
    fontFamily: "Courier",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 3,
  },
  countdown2: {
    fontSize: 38,
    fontFamily: "Courier",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 3,
  },
  // countdown: {
  //   fontSize: 46,
  //   fontFamily: "Kurale_400Regular",
  //   textShadowColor: "rgba(0, 0, 0, 0.5)",
  //   textShadowOffset: { width: 3, height: 3 },
  //   textShadowRadius: 3,
  // },
  // countdown2: {
  //   fontSize: 38,
  //   fontFamily: "Kurale_400Regular",
  //   textShadowColor: "rgba(0, 0, 0, 0.5)",
  //   textShadowOffset: { width: 3, height: 3 },
  //   textShadowRadius: 3,
  // },
  checkInButton: {
    width: 250,
    backgroundColor: Colors.magenta,
    padding: "0%",
    borderRadius: 12,
    paddingHorizontal: "10%",
    marginTop: "25%",
    // margin: "10%",
    alignContent: "center",
    justifyContent: "center",
  },
  checkedInButton: {
    backgroundColor: Colors.grayCell,
  },
  checkInButtonText: {
    color: "#ffffff",
    fontSize: 44,
    fontFamily: "Kurale_400Regular",
    justifyContent: "center",
    alignSelf: "center",
  },
  checkedInText: {
    color: Colors.grayText,
  },
  yellowButton: {
    backgroundColor: "gold",
    padding: "1%",
    borderRadius: 12,
    marginTop: "5%",
  },
  yellowButtonText: {
    color: "#ffffff",
    fontSize: 46,
    fontFamily: "Kurale_400Regular",
  },
});
