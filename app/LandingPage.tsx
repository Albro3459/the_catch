import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Button,
  Pressable,
  Dimensions,
  LayoutChangeEvent,
} from "react-native";
import {BlurView} from "expo-blur"
import React, { useState, useEffect, useRef } from "react";
import LocationDropSVG from "../assets/images/LocationDropSVG.svg";
import { Colors } from "@/constants/Colors";
import { ClearGlobalState, ClearGlobalStateMatchData, GlobalState, LogoutUserAsync } from "@/GlobalState";
import * as SplashScreen from "expo-splash-screen";
import { router, usePathname, Link } from "expo-router";
import {
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

import { profileStyles } from "../styles/profileStyles";

import { calcZodiacFromDate, ZodiacSign } from "./helpers/calcZodiacFromDate";
import { isValidDateFormat } from "./helpers/dateHelper";
import { GetAge } from "./helpers/getAge";
import { fetchMatchedUserID } from "./helpers/matchHelper";
import { Video } from "expo-av";
import { getRandomGroups } from "./helpers/randomGeneratorHelper";

// Prevent splash screen from hiding until everything is loaded
SplashScreen.preventAutoHideAsync();

const screenWidth = Dimensions.get("window").width;

export default function LandingPage() {
  const pathname = usePathname();
  // const storage = getStorage(app);

  // Used for Bio Text to center when it is one line
  const [isSingleLine, setIsSingleLine] = useState(false);

  // returns how many items in the set or string (string is always 1)
  function getAttributeCount(inputSet: Set<string> | string[] | string): number | null {
    if (inputSet) {
      if (typeof inputSet === "string") {
        return 1;
      } else if (inputSet instanceof Set) {
        return inputSet.size;
      }
      else {
        return inputSet.length;
      }
    }
    return null;
  }

  // returns true if attribute is empty or fails the check
  function isAttributeEmpty(inputSet: Set<string> | string[] | string): boolean | null {
    if (inputSet) {
      if (typeof inputSet === "string") {
        return !(inputSet.length > 0);
      } else if (inputSet instanceof Set) {
        return !(inputSet.size > 0);
      } else {
        return !(inputSet.length == 0);
      }
    }
    return true;
  }

  function toArray(inputSet: Set<string> | string[] | string) {
    if (inputSet) {
      if (typeof inputSet === "string") {
        return [inputSet];
      } else if (inputSet instanceof Set) {
        return Array.from(inputSet);
      }
      else {
        return inputSet;
      }
    }
    return [];
  }

  // State for text inputs
  const [nameText, setNameText] = useState<string>("");
  const [birthdayText, setBirthdayText] = useState<string>("");
  const [locationText, setLocationText] = useState<string>("");
  const [bioText, setBioText] = useState<string>("");
  const [hometownText, setHometownText] = useState<string>("");
  const [occupationText, setOccupationText] = useState<string>("");

  // State for pictures
  const [profilePic, setProfilePic] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const getPhotosLength = (photos: string[]) => {
    let count = 0;
    for (const photo of photos) {
      if (photo && photo !== "") {
        count++;
      }
    }
    return count;
  };
  const [video, setVideo] = useState<string>("");

  // State for selected attributes
  const [selectedPronoun, setSelectedPronoun] = useState<string>("");
  const [selectedOrientation, setSelectedOrientation] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(
    new Set()
  );
  const [selectedReligions, setSelectedReligions] = useState<Set<string>>(
    new Set()
  );
  const [selectedEducations, setSelectedEducations] = useState<Set<string>>(
    new Set()
  );
  const [selectedHobbies, setSelectedHobbies] = useState<Set<string>>(
    new Set()
  );
  const [selectedMusic, setSelectedMusic] = useState<Set<string>>(new Set());
  const [selectedZodiac, setSelectedZodiac] = useState<string>();
  const setZodiacState = (value: string) => {
    if (zodiac_isVisible) {
      setSelectedZodiac(value);
    }
  };
  useEffect(() => {
    if (zodiac_isVisible) {
      let invalid = true;
      if (birthdayText && isValidDateFormat(birthdayText)) {
        const sign = calcZodiacFromDate(birthdayText);
        if (sign.length != 0) {
          invalid = false;
          setZodiacState(sign);
        }
      }
      if (invalid) {
        setZodiacState("Enter Birthday for Zodiac Sign");
        console.log("Invalid or missing birthday text");
      }
    }
  }, [birthdayText]);
  const [selectedPets, setSelectedPets] = useState<Set<string>>(new Set());
  const [selectedDiets, setSelectedDiets] = useState<Set<string>>(new Set());
  const [selectedIcks, setSelectedIcks] = useState<Set<string>>(new Set());
  const [selectedSubstances, setSelectedSubstances] = useState<Set<string>>(
    new Set()
  );

  // State for special fields visbility
  const [zodiac_isVisible, setZodiacIsVisible] = useState<boolean>(false);
  const [photos_isVisible, setPhotosIsVisible] = useState<boolean>(false);
  const [video_isVisible, setVideoIsVisible] = useState<boolean>(false);

  type FieldMapping = {                               // clear function if not visible
    [key: string]: [(value: any) => void, string, () => void];
  };
  const fieldMapping: FieldMapping = {
    location: [setLocationText, "location_isVisible", () => setLocationText("")],
    bio: [setBioText, "bio_isVisible", () => setBioText("")],
    hometown: [setHometownText, "hometown_isVisible", () => setHometownText("")],
    occupation: [setOccupationText, "occupation_isVisible", () => setOccupationText("")],
    pronouns: [setSelectedPronoun, "pronouns_isVisible", () => setSelectedPronoun("")],
    orientation: [setSelectedOrientation, "orientation_isVisible", () => setSelectedOrientation("")],
    languages: [
      (value) => setSelectedLanguages(new Set(value || [])),
      "languages_isVisible",
      () => setSelectedLanguages(new Set())
    ],
    religion: [
      (value) => setSelectedReligions(new Set(value || [])),
      "religion_isVisible",
      () => setSelectedReligions(new Set())
    ],
    education: [
      (value) => setSelectedEducations(new Set(value || [])),
      "education_isVisible",
      () => setSelectedEducations(new Set())
    ],
    hobbies: [
      (value) => setSelectedHobbies(new Set(value || [])),
      "hobbies_isVisible",
      () => setSelectedHobbies(new Set())
    ],
    music: [
      (value) => setSelectedMusic(new Set(value || [])),
      "music_isVisible",
      () => setSelectedMusic(new Set())
    ],
    pets: [
      (value) => setSelectedPets(new Set(value || [])), 
      "pets_isVisible",
      () => setSelectedPets(new Set())
    ],
    diet: [
      (value) => setSelectedDiets(new Set(value || [])), 
      "diet_isVisible",
      () => setSelectedDiets(new Set())
    ],
    icks: [
      (value) => setSelectedIcks(new Set(value || [])), 
      "icks_isVisible",
      () => setSelectedIcks(new Set())
    ],
    substances: [
      (value) => setSelectedSubstances(new Set(value || [])),
      "substances_isVisible",
      () => setSelectedSubstances(new Set())
    ],
  };

  const navigateTo = (path) => {
    if (pathname !== path) {
      router.push(path);
    }
  };

  // listening to match user changes and only updating on changes
  const useMatchProfileListener = () => {  
    const [isLoading, setIsLoading] = useState(true);

    // let landingPageUnsubscribeUser;
    // let landingPageUnsubscribeMatch;
  
    useEffect(() => {
      if (pathname !== "/LandingPage" || GlobalState.isMatching) return;
  
      const initializeMatchProfile = async () => {
        try {
          await SplashScreen.preventAutoHideAsync();
  
          const userID = GlobalState.userID;
  
          if (!userID ||
              !GlobalState.isUserSignedIn ||
              GlobalState.userID == "" ||
              GlobalState.username == ""
          ) {
            await LogoutUserAsync();
            ClearGlobalState();
            // router.push("/");
            navigateTo("/");
            return;
          }
  
          const matchedUserID = await fetchMatchedUserID(userID);
  
          if (!matchedUserID) {
            ClearGlobalStateMatchData();
            console.log("No match found for this user.");
            // router.push("/unmatched");
            navigateTo("/unmatched");
            return;
          }

          interface MatchData {
            user1_id: string;
            user2_id: string;
            revealGroups: string[];
            isDeleted: boolean;
          }
          // Listener for the Matches table to checkfor Reveals and isDeleted
          let matchesTableRef;
          if (matchedUserID) {
            matchesTableRef = doc(db, "Matches", GlobalState.matchID);
            // Loading cached data if possible
            if (matchesTableRef) {
              const matchTableSnapshot = await getDoc(matchesTableRef);
              if (matchTableSnapshot.exists()) {
                const initialData = matchTableSnapshot.data() as MatchData;
                console.log("Initial Match Table Data:", matchTableSnapshot);
                if (!initialData.isDeleted) {
                  const groups = initialData.revealGroups || [];
                  revealGroups(groups);
                  console.log(`Revealed groups: ${groups}`);
                  GlobalState.isMatchProfilePicRevealed = isRevealed("ProfilePic") || false;
                }
              }
            }
            else {
              console.error("Invalid Matches Table reference.");
              return;
            }
            
            if (GlobalState.landingPageUnsubscribeMatch) {
              // Unsubscribe if a listener already exists
              GlobalState.landingPageUnsubscribeMatch();
              GlobalState.landingPageUnsubscribeMatch = null;
              console.log("Previous match listener unsubscribed.");
            }
            GlobalState.landingPageUnsubscribeMatch = onSnapshot(
              matchesTableRef,
              { includeMetadataChanges: true },
              async (matchSnapshot) => {
                if (!GlobalState.isUserSignedIn || !matchedUserID) {
                  console.log("Listener stopped: User is not signed in.");
                  if (GlobalState.landingPageUnsubscribeUser) GlobalState.landingPageUnsubscribeUser();
                  return;
                }
                if (matchSnapshot.exists()) {
                  if (matchSnapshot.metadata.fromCache) {
                    console.log("LandingPage MATCH: Data is from cache; waiting for server data...");
                    return; 
                  }
                  if (!GlobalState.isUserSignedIn ||
                    GlobalState.userID == "" ||
                    GlobalState.username == "" ||
                    pathname !== "/LandingPage"
                  ) {
                    await LogoutUserAsync();
                    ClearGlobalState();
                    // router.push("/");
                    navigateTo("/");
                    return;
                  }

                  const matchData = matchSnapshot.data() as MatchData;
                  if (matchData.isDeleted) {
                    console.log("Match has been deleted.");
                    ClearGlobalStateMatchData();
                    // router.push("/unmatched");
                    navigateTo("/unmatched");
                  }
                  else {
                    GlobalState.isMatched = true;
                    const groups = matchData.revealGroups || [];
                    revealGroups(groups);
                    console.log(`Revealed groups: ${groups}`);
                    GlobalState.isMatchProfilePicRevealed = isRevealed("ProfilePic") || false;
                  }
                } else {
                  console.warn("Match document not found in Matches table.");
                  ClearGlobalStateMatchData();
                  // router.push("/unmatched");
                  navigateTo("/unmatched");
                }
              },
              (error) => {
                console.error("Error listening to Matches table updates:", error);
                ClearGlobalStateMatchData();
                // router.push("/unmatched");
                navigateTo("/unmatched");
              }
            );
          }

          const matchRef = doc(db, "Users", matchedUserID);

          // Loading cached data if possible
          const docSnapshot = await getDoc(matchRef);
          if (docSnapshot.exists()) {
            const initialData = docSnapshot.data();
            console.log("Initial Match Data:", initialData);

            GlobalState.matchName = initialData.name;
            setNameText(initialData.name);
            setBirthdayText(initialData.birthday);

            setPhotosIsVisible(initialData.photos_isVisible);
            setVideoIsVisible(initialData.video_isVisible);
            setZodiacIsVisible(initialData.zodiac_isVisible);

            Object.entries(fieldMapping).forEach(
              ([field, [setFunction, visibilityField, clearFunction]]) => {
                if (initialData[field] !== undefined) {
                  initialData[visibilityField] ? setFunction(initialData[field]) : clearFunction();
                }
              }
            );

            const matchProfilePic = initialData.profilePic || "";
            GlobalState.matchProfilePic = matchProfilePic;
            setProfilePic(matchProfilePic);

            const matchPhotos = initialData.photos || [];
            GlobalState.matchPhotos = matchPhotos;
            setPhotos(matchPhotos);

            const matchVideo = initialData.video || "";
            GlobalState.matchVideo = matchVideo;
            setVideo(matchVideo);
          }
  
          if (GlobalState.landingPageUnsubscribeUser) {
            GlobalState.landingPageUnsubscribeUser();
            GlobalState.landingPageUnsubscribeUser = null;
            console.log("LandingPage User listener unsubscribed.");
          }
          GlobalState.landingPageUnsubscribeUser = onSnapshot(
            matchRef,
            { includeMetadataChanges: true },
            async (matchSnapshot) => {
              if (!GlobalState.isUserSignedIn || !matchedUserID) {
                console.log("Listener stopped: User is not signed in.");
                if (GlobalState.landingPageUnsubscribeUser) GlobalState.landingPageUnsubscribeUser();
                return;
              }
              if (matchSnapshot.exists()) {
                if (matchSnapshot.metadata.fromCache) {
                  console.log("LandingPage USER: Data is from cache; waiting for server data...");
                  return;
                }
                if (!GlobalState.isUserSignedIn ||
                  GlobalState.userID == "" ||
                  GlobalState.username == "" ||
                  pathname !== "/LandingPage"
                ) {
                  await LogoutUserAsync();
                  ClearGlobalState();
                  // router.push("/");
                  navigateTo("/");
                  return;
                }

                const matchData = matchSnapshot.data();
  
                GlobalState.matchName = matchData.name;
                setNameText(matchData.name);
                setBirthdayText(matchData.birthday);
  
                setPhotosIsVisible(matchData.photos_isVisible);
                setVideoIsVisible(matchData.video_isVisible);
                setZodiacIsVisible(matchData.zodiac_isVisible);
  
                Object.entries(fieldMapping).forEach(
                  ([field, [setFunction, visibilityField, clearFunction]]) => {
                    if (matchData[field] !== undefined) {
                      matchData[visibilityField] ? setFunction(matchData[field]) : clearFunction();
                    }
                  }
                );
  
                const matchProfilePic = matchData.profilePic || "";
                GlobalState.matchProfilePic = matchProfilePic;
                setProfilePic(matchProfilePic);
  
                const matchPhotos = matchData.photos || [];
                GlobalState.matchPhotos = matchPhotos;
                setPhotos(matchPhotos);
  
                const matchVideo = matchData.video || "";
                GlobalState.matchVideo = matchVideo;
                setVideo(matchVideo);
  
                console.log("Match Data Updated:", matchData);
              } else {
                console.error("Match not found");
                ClearGlobalStateMatchData();
                // router.push("/unmatched");
                navigateTo("/unmatched");
              }
            },
            (error) => {
              console.error("Error listening to match profile updates:", error);
              ClearGlobalStateMatchData();
              // router.push("/unmatched");
              navigateTo("/unmatched");
            }
          );

          // fetch the profilePic of the current user ahead of time
          const userRef = doc(db, "Users", userID);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            GlobalState.userProfilePic = userData.profilePic || "";
            console.log('Prefetched the users profile pic on the Landing Page');
          }
  
          // Cleanup listener when component unmounts or pathname changes
          return () => {
            if (GlobalState.landingPageUnsubscribeUser) {
              GlobalState.landingPageUnsubscribeUser();
              GlobalState.landingPageUnsubscribeUser = null;
              console.log("LandingPage: Firestore User listener unsubscribed.");
            }
            if (GlobalState.landingPageUnsubscribeMatch != null) {
              GlobalState.landingPageUnsubscribeMatch();
              GlobalState.landingPageUnsubscribeMatch = null;
              console.log("LandingPage: Firestore Match listener unsubscribed.");
            }
          };
        } catch (error) {
          console.error("Error initializing match profile listener:", error);
          ClearGlobalStateMatchData();
          // router.push("/unmatched");
          navigateTo("/unmatched");
        } finally {
          setIsLoading(false);
          SplashScreen.hideAsync();
        }
      };
  
      initializeMatchProfile();
    }, [pathname]);

    return isLoading;
  };

  type AttributeMapping = [string, string | string[] | Set<string>][];                             
    
  // this is used for the order that they show up on the landing page
  const attributes: AttributeMapping = [
    ["Orientation", selectedOrientation],
    ["Languages", selectedLanguages],
    ["Religion", selectedReligions],
    ["Education", selectedEducations],
    ["Hometown", hometownText],
    ["Occupation", occupationText],
    ["Hobbies", selectedHobbies],
    ["Music", selectedMusic],
    ["Zodiac Sign", selectedZodiac],
    ["Pets", selectedPets],
    ["Diet", selectedDiets],
    ["Icks", selectedIcks],
    ["Substances", selectedSubstances],
  ];

  const attributesLength = attributes.length;

  const [groupA, groupB, groupC] = getRandomGroups(attributes);

  groupA.push(["ProfilePic", profilePic]); // Reveal profile pic
  groupA.push(["Photos", new Set<number>([0])]); // Reveal 1 photo

  groupB.push(["Photos", new Set<number>([1, 2])]); // Reveal 2 more photos
  groupB.push(["Video", video]); // Reveal video if available

  groupC.push(["Photos", new Set<number>([3, 4, 5])]); // Reveal 3 more photos

  // Map groups for easy toggling
  const attributeGroups = { A: groupA, B: groupB, C: groupC };

  // Visibility state for groups
  const [revealedGroups, setRevealedGroups] = useState<Set<string>>(new Set<string>(GlobalState.groupsRevealed));

  // Function to reveal a group
  const revealGroups = (groups: string[]) => {
    setRevealedGroups((prev) => {
      const updatedGroups = new Set<string>(prev);
  
      if (groups === null || groups.length === 0) {
        updatedGroups.clear();
      } else {
        groups.forEach((group) => updatedGroups.add(group));
      }
  
      GlobalState.groupsRevealed = Array.from(updatedGroups);
  
      return updatedGroups;
    });
  };

  // Function to check if an attribute should be revealed
  const isRevealed = (attribute: string): boolean | null => {
    for (const groupName of revealedGroups) {
      const attributes = attributeGroups[groupName];
      if (attributes.some(([key]) => key === attribute)) {
        return true;
      }
    }
    return false;
  };

  // Function to check if if photo index is revealed
  const isPhotoRevealed = (index: number): boolean | null => {
    for (const groupName of revealedGroups) {
      const attributes = attributeGroups[groupName];
      if (attributes.some(([key, value]) => key === "Photos" && value instanceof Set && value.has(index))) {
        return true;
      }
    }
    return false;
  };

  const [viewHeight, setViewHeight] = useState(0);
  const myViewRef = useRef(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setViewHeight(height);
  };

  const isStillLoading = useMatchProfileListener();

  // Show splash screen until loaded
  useEffect(() => {
    if (!isStillLoading) {
      SplashScreen.hideAsync();
    }
  }, [isStillLoading]);

  if (isStillLoading) {
    return null; // Prevent rendering until loaded
  }

  return (
    <ScrollView style={styles.background}>
      <View ref={myViewRef} onLayout={handleLayout}>
        <View style={styles.container}>
          {/* zindex has to be above the ProfilePic image because it has a bunch of negative margin */}
          <Pressable style={{ alignSelf: "flex-end", zIndex: 10 }}>
            <Link href="/report">
              <View style={styles.reportCircle}>
                <Text style={{ alignSelf: "center", fontSize: 20 }}>!</Text>
              </View>
            </Link>
          </Pressable>
          
          <View
            style={[
              profileStyles.matchTopContainer, 
              !isRevealed("ProfilePic") && profileStyles.blurredPhoto,
            ]}
          >
            {GlobalState.matchProfilePic ? (
              <Image
                source={{ uri: GlobalState.matchProfilePic }}
                style={profileStyles.matchProfileImage}
              />
            ) : (
              <Image
                source={require("../assets/images/BlankProfilePicTAKEPHOTO.png")}
                style={profileStyles.matchProfileImage}
              />
            )}
            {!isRevealed("ProfilePic") && (
              <View style={StyleSheet.absoluteFill}>
                {/* Solid background color for consistent appearance */}
                <View style={[StyleSheet.absoluteFill, profileStyles.imageBlurBackground, profileStyles.matchProfileImage]} />
                <BlurView style={[StyleSheet.absoluteFill, profileStyles.blurBox, profileStyles.blur, profileStyles.matchProfileImage]} tint="light">
                  <Text style={[profileStyles.blurText, { fontSize: 25 }]}>Interact more to unlock!</Text>
                </BlurView>
              </View>
            )}
          </View>
          <Text style={[styles.bigText, { paddingTop: 15 }]}>{nameText}</Text>
          <Text style={styles.smallText}>
            {selectedPronoun.length > 0 ? `${selectedPronoun} | ` : ""}
            {GetAge(birthdayText)}
          </Text>

          {locationText.length > 0 && (
            <View style={styles.locationContainer}>
              <View style={styles.svgContainer}>
                <LocationDropSVG width="100%" height="100%" />
              </View>
              <Text style={styles.verySmallText}>{locationText}</Text>
            </View>
          )}

          {/* This is the space for the chat button */}
          <View style={{ marginVertical: "5%" }}>
            <Pressable style={styles.purpleButton}>
              <Link href="/Chat">
                <Text style={styles.purpleButtonText}>Chat</Text>
              </Link>
            </Pressable>
          </View>
        </View>

        {/* This is the container that contains the bio */}
        {bioText.length > 0 && (
          <View style={profileStyles.container}>
            <Text
              style={[
                styles.bioTextBox,
                isSingleLine && { textAlign: "center" },
              ]}
              onTextLayout={(e) => {
                setIsSingleLine(e.nativeEvent.lines.length === 1);
              }}
            >
              {bioText}
            </Text>
          </View>
        )}

        {/* Everything in this view is the attributes about the person */}
        <View style={styles.leftAlignedContainer}>
          {Array.from({ length: attributesLength }).map((_, i) => {
            if (isAttributeEmpty(attributes[i][1])) {
              return null;
            } else if (
              attributes[i][0] !== "Photos" &&
              attributes[i][0] !== "Video"
            ) {
              return (
                <View key={`attribute-${i}`}>
                  {getAttributeCount(attributes[i][1]) > 1 && (
                    <View style={{ alignItems: "flex-start" }}>
                      <Text style={styles.attributeName}>
                        {attributes[i][0]}:
                      </Text>
                      {i !== attributesLength && (
                        <View
                          style={[styles.attributeView, !isRevealed(attributes[i][0]) && {paddingVertical: "3%"}]}
                          key={`attribute-${i}`}
                        >
                          {Array.from({
                            length: getAttributeCount(attributes[i][1]),
                          }).map((_, index) => (
                            <View style={!isRevealed(attributes[i][0]) ? profileStyles.blur : styles.attribute} key={`attribute-${i}-${index}`}>
                              <Pressable
                                style={!isRevealed(attributes[i][0]) && {minHeight: 20, maxHeight: 20}}
                                key={`attribute-${i}-${index}`}
                              >
                                <Text style={[styles.attributeText]}>
                                  {toArray(attributes[i][1])[index]}
                                </Text>
                              </Pressable>
                            </View>
                          ))}
                          {!isRevealed(attributes[i][0]) && (
                            <View style={StyleSheet.absoluteFill}>
                              {/* Solid background color for consistent appearance */}
                              <View style={[StyleSheet.absoluteFill, profileStyles.pressableBlurBackground]} />
                              <BlurView style={[StyleSheet.absoluteFill, profileStyles.blurBox, profileStyles.blur]} tint="light">
                                <Text style={[profileStyles.blurText, { fontSize: 20 }]}>Interact more to unlock!</Text>
                              </BlurView>
                            </View>
                          )}                 
                          </View>
                      )}
                      {i !== attributesLength - 1 && (
                        <View style={styles.separatorLine}></View>
                      )}
                    </View>
                  )}
                  {getAttributeCount(attributes[i][1]) == 1 && (
                    <View style={{ alignItems: "flex-start" }}>
                      <View style={styles.attributeViewSingle}>
                        <Text style={styles.attributeName}>
                          {attributes[i][0]}:
                        </Text>
                        {i !== attributesLength && (
                          <View style={!isRevealed(attributes[i][0]) ? profileStyles.blur : styles.attribute}>
                            <Pressable style={!isRevealed(attributes[i][0]) && {minHeight: 20, maxHeight: 20}}>
                              <Text style={styles.attributeText}>
                                {attributes[i][1]}
                              </Text>
                            </Pressable>
                            {!isRevealed(attributes[i][0]) && (
                            <View style={StyleSheet.absoluteFill}>
                              {/* Solid background color for consistent appearance */}
                              <View style={[StyleSheet.absoluteFill, profileStyles.pressableBlurBackground]} />
                              <BlurView style={[StyleSheet.absoluteFill, profileStyles.blurBox, profileStyles.blur]} tint="light">
                                <Text style={[profileStyles.blurText]}>Interact more to unlock!</Text>
                              </BlurView>
                            </View>
                          )}
                          </View>
                        )}
                      </View>
                      {i !== attributesLength - 1 && (
                        <View style={styles.separatorLine}></View>
                      )}
                    </View>
                  )}
                </View>
              );
            }
          })}
        </View>

        {/* Photos */}
        {photos_isVisible && <View style={profileStyles.separatorLine}></View>}
        {photos_isVisible && (
          <View style={profileStyles.container}>
            <View style={profileStyles.labelContainer}>
              <Text style={profileStyles.labelText}>Photos:</Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              ></View>
            </View>
            <View style={profileStyles.photosContainer}>
            {GlobalState.matchPhotos.map((photo, index) => (
              <View style={[profileStyles.photoShadow]} key={index}>
                {photo && (
                  <View
                    style={[
                      !isPhotoRevealed(index) && profileStyles.blurredPhoto,
                    ]}
                  >
                    <Image
                      style={profileStyles.photo}
                      source={{ uri: photo }}
                    />
                    {!isPhotoRevealed(index) && (
                      <View style={StyleSheet.absoluteFill}>
                        {/* Solid background color for consistent appearance */}
                        <View style={[StyleSheet.absoluteFill, profileStyles.imageBlurBackground]} />
                        <BlurView style={[StyleSheet.absoluteFill, profileStyles.blurBox, profileStyles.blur, {borderRadius: 10}]} tint="light">
                          <Text style={[profileStyles.blurText]}>Interact more to unlock!</Text>
                        </BlurView>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
            </View>
          </View>
        )}

        {/* Video */}
        {video_isVisible && GlobalState.matchVideo && (
          <View style={profileStyles.separatorLine}></View>
        )}
        {video_isVisible && GlobalState.matchVideo && (
          <View style={profileStyles.container}>
            <View style={profileStyles.labelContainer}>
              <Text style={profileStyles.labelText}>Personal Video:</Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              ></View>
            </View>
            <View style={profileStyles.photosContainer}>
            {GlobalState.matchVideo.length > 0 && (
              <View style={[profileStyles.photoShadow]}>
                <View
                  style={[
                    !isRevealed("Video") && profileStyles.blurredPhoto, // Apply blur if not revealed
                  ]}
                >
                  <Video
                    style={profileStyles.video}
                    source={{ uri: GlobalState.matchVideo }}
                    isLooping={true}
                    shouldPlay={isRevealed("Video")}
                    volume={0.0}
                  />
                  {!isRevealed("Video") && (
                    <View style={StyleSheet.absoluteFill}>
                      {/* Solid background color for consistent appearance */}
                      <View style={[StyleSheet.absoluteFill, profileStyles.imageBlurBackground]} />
                      <BlurView style={[StyleSheet.absoluteFill, profileStyles.blurBox, profileStyles.blur, {borderRadius: 10}]} tint="light">
                        <Text style={[profileStyles.blurText]}>Interact more to unlock!</Text>
                      </BlurView>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
        )}

        {/* buffer space for the bottom */}
        <View style={{ padding: "42%" }}></View>
      </View>

      {/* This is the lock Icon, may need to do some sort of magic in order to get it to be in front of the correct values */}
      <View style={[styles.cover, { top: viewHeight - screenWidth * 0.68 }]}>
        <Text style={styles.bigText}>Hidden Info</Text>
        <Text style={styles.textPoints}>Interact with your match to unlock!</Text>
        <Pressable style={styles.breakupButton}>
          <Link href={"./breakup"}>
            <Text style={styles.breakupButtonText}>Break Up?</Text>
          </Link>
        </Pressable>
      </View>

      <View
        style={[styles.bottomOfPage, { top: viewHeight - screenWidth * 0.77 }]}
      >
        <View style={styles.lockLineLeft}></View>
        <View style={styles.lockOutline}>
          <View style={styles.lockContainer}>
            <View style={styles.lockArc} />
            <View style={styles.lockBody} />
          </View>
        </View>
        <View style={styles.lockLineRight}></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.pink,
    padding: "5%",
  },
  container: {
    backgroundColor: "white",
    padding: "3%",
    borderRadius: 10,
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: "5%",
  },
  leftAlignedContainer: {
    backgroundColor: "white",
    padding: "3%",
    paddingVertical: "5%",
    borderRadius: 15,
    justifyContent: "space-around",
    alignItems: "flex-start",
    marginVertical: "5%",
  },
  locationContainer: {
    width: "80%",
    height: "20%",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  bioTextBox: {
    fontSize: 18,
    fontFamily: "Kurale_400Regular",
    width: "87.5%",
    textAlignVertical: "top",
    alignSelf: "center",
  },
  image: {
    width: 450,
    height: 450,
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: -100,
  },
  smallText: {
    fontSize: 28,
    fontFamily: "Kurale_400Regular",
  },
  bigText: {
    fontSize: 48,
    fontFamily: "Kurale_400Regular",
  },
  bioText: {
    fontSize: 15,
    padding: "1%",
    fontFamily: "Kurale_400Regular",
  },
  verySmallText: {
    fontSize: 14,
    padding: "1%",
  },
  purpleButton: {
    backgroundColor: Colors.darkPurple,
    padding: "0%",
    borderRadius: 10,
    paddingHorizontal: "8%",
  },
  purpleButtonText: {
    color: "#ffffff",
    fontSize: 48,
    fontFamily: "Kurale_400Regular",
  },
  reportCircle: {
    width: 30,
    height: 30,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.grayText,
    justifyContent: "center",
  },
  attributeName: {
    fontSize: 24,
    padding: "1%",
    paddingLeft: "3%",
    alignSelf: "flex-start",
    fontFamily: "Kurale_400Regular",
  },
  separatorLine: {
    backgroundColor: "gray",
    marginVertical: 10,
    alignSelf: "center",
    paddingHorizontal: "48%",
    paddingVertical: "0.25%",
  },
  attribute: {
    borderRadius: 30,
    backgroundColor: Colors.grayCell,
    paddingHorizontal: "4%",
    paddingVertical: "4%",
  },
  attributeLast: {
    borderRadius: 30,
    backgroundColor: Colors.grayCell,
    paddingHorizontal: "6%",
    paddingVertical: "6%",
  },
  attributeView: {
    width: "100%",
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "flex-start",
    rowGap: screenWidth / 100,
    // columnGap: screenWidth / 90,
    // paddingHorizontal: "2%",

    // paddingVertical: "3%",
  },
  attributeText: {
    fontSize: 16,
    color: Colors.grayText,
  },
  attributeViewSingle: {
    flexDirection: "row",
    width: "100%",
  },
  lockOutline: {
    borderRadius: 1000,
    borderColor: "black",
    borderWidth: 4,
    width: "20%",
    aspectRatio: 1,
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  lockLineLeft: {
    height: 3,
    backgroundColor: "black",
    alignSelf: "center",
    width: "45%",
    marginLeft: "-6%",
  },
  lockLineRight: {
    height: 3,
    backgroundColor: "black",
    alignSelf: "center",
    width: "45%",
  },
  lock: {
    width: screenWidth / 10,
    height: screenWidth / 10,
    borderRadius: 40,
  },
  bottomOfPage: {
    flexDirection: "row",
    alignContent: "center",
    position: "absolute",
  },
  cover: {
    position: "absolute",
    bottom: 0,
    height: "15%",
    width: "112%",
    backgroundColor: Colors.pink,
    marginLeft: "-6%",
    alignItems: "center",
    paddingTop: "10%",
  },
  textPoints: {
    fontSize: 20,
    color: Colors.grayText,
    padding: "1%",
    alignSelf: "center",
  },
  breakupButton: {
    backgroundColor: Colors.magenta,
    paddingHorizontal: "5%",
    paddingVertical: "2%",
    marginTop: "4%",
    borderRadius: 20,
  },
  breakupButtonText: {
    color: "white",
    fontSize: 32,
    fontFamily: "Kurale_400Regular",
  },
  lockContainer: {
    width: 50,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  lockBody: {
    width: screenWidth / 10,
    height: screenWidth / 14,
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: "white",
    marginTop: "10%",
  },
  lockArc: {
    position: "absolute",
    width: screenWidth / 14,
    height: screenWidth / 14,
    borderRadius: screenWidth / 24,
    borderColor: "black",
    borderWidth: 3,
    top: screenWidth / 50,
    left: screenWidth / 35,
    transform: [{ rotate: "45deg" }],
  },
  svgContainer: {
    width: "20%",
  },
});
