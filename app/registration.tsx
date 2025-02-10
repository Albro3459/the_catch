import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Link, Href, router, usePathname } from "expo-router";
import { app, db } from "../firebaseConfig";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { calcZodiacFromDate, ZodiacSign } from "./helpers/calcZodiacFromDate";
import { dateToString, isValidDateFormat, stringToDate } from "./helpers/dateHelper";

import {
  EyeToggle,
  LeavingEditScreenAlert,
  MultiPressableBubblesGroup,
  SinglePressableBubbleGroup,
} from "./components/formComponents";
import { Colors } from "@/constants/Colors";
import { profileStyles } from "../styles/profileStyles";
import AddPhotoSVG from "../assets/images/AddPhotoSVG.svg";
import AddVideoSVG from "../assets/images/AddVideoSVG.svg";
import PlaceholderPhotoSVG from "../assets/images/PlaceholderPhotoSVG.svg"
import { GlobalState, IsUserRegisteredAsync, LogoutUserAsync } from "@/GlobalState";
import { uploadMedia, selectMedia, MediaType } from "./helpers/mediaHelper";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Video } from "expo-av";


export default function Registration() {
  // const router = useRouter();
  const pathname = usePathname();
  const storage = getStorage(app);

  // Validating these required fields
  const [errors, setErrors] = useState({ 
      profilePic: false,
      name: false, 
      birthday: false, 
      location: false,
      pronouns: false,
      orientation: false,
      languages: false,
      religions: false,
      educations: false,
      bio: false,
      hometown: false,
      occupation: false,
      hobbies: false,
      musics: false,
      //zodiac
      pets: false,
      diets: false,
      icks: false,
      substances: false,
      photos: false
    });

  // State for text inputs
  const [nameText, setNameText] = useState<string>("");
  const [birthdayText, setBirthdayText] = useState<string>("");
  // Date picker for birthday
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(stringToDate(birthdayText));
  const handleConfirmDate = (birthdayDate: Date) => {
    setGlobalIsEditing(true);
    setBirthdayText(dateToString(birthdayDate));
    setSelectedDate(birthdayDate);
    setPickerVisible(false);
  };
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

  // State for each section's eye icon
  const [locationEyeIcon, setLocationEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [pronounsEyeIcon, setPronounsEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [orientationEyeIcon, setOrientationEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [languageEyeIcon, setLanguageEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [religionEyeIcon, setReligionEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [educationEyeIcon, setEducationEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [bioEyeIcon, setBioEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [hometownEyeIcon, setHometownEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [occupationEyeIcon, setOccupationEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [hobbiesEyeIcon, setHobbiesEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [musicEyeIcon, setMusicEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [zodiacEyeIcon, setZodiacEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [petsEyeIcon, setPetsEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [dietEyeIcon, setDietEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [icksEyeIcon, setIcksEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [substanceEyeIcon, setSubstanceEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [photosEyeIcon, setPhotosEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");
  const [videoEyeIcon, setVideoEyeIcon] =
    useState<React.ComponentProps<typeof Feather>["name"]>("eye");

  // Options of attributes, the Set is used when they add a new attribute with the plus button
  const [pronouns, setPronouns] = useState<string[]>([
    "He/Him 👨‍🦱",
    "She/Her 👩‍🦱",
    "They/Them 🧑‍🦱",
    "Any 🌈",
    "Other ⚧️",
  ]);
  const [orientation, setOrientation] = useState<string[]>([
    "Straight 👨‍❤️‍👩",
    "Gay 🌈",
    "Lesbian 🏳️‍🌈",
    "Bisexual 💜",
    "Pansexual 🌸",
  ]);
  const [languages, setLanguages] = useState<string[]>([
    "English 🇺🇸",
    "Spanish 🇪🇸",
    "Japanese 🇯🇵",
    "Chinese 🇨🇳",
    "Mandarin 🐉",
  ]);
  const [religions, setReligions] = useState<string[]>([
    "Christian ✝️",
    "Catholic ⛪",
    "Jewish ✡️",
    "Hindu 🕉️",
    "Islamic ☪️",
    "Agnostic ❔",
  ]);
  const [educations, setEducations] = useState<string[]>([
    "Bachelors 🎓",
    "High School 🏫",
    "Masters 📜",
    "PhD 🎓📘",
  ]);
  const [hobbies, setHobbies] = useState<string[]>([
    "Gym 🏋️",
    "Reading 📚",
    "Hiking 🥾",
    "Gaming 🎮",
    "Cooking 🍳",
    "Hunting 🏹",
  ]);
  const [musics, setMusics] = useState<string[]>([
    "Rap 🎤",
    "Rock 🎸",
    "Pop 🎧",
    "R&B 🎶",
    "Country 🪕",
    "Indie 🎹",
    "Classical 🎼",
  ]);
  const [zodiac, setZodiac] = useState<string>(
    calcZodiacFromDate(birthdayText)
  );
  const [pets, setPets] = useState<string[]>([
    "Dogs 🐶",
    "Cats 🐱",
    "Fish 🐟",
    "Horses 🐴",
    "Rabbits 🐇",
    "Guinea Pigs 🐹",
  ]);
  const [diets, setDiets] = useState<string[]>([
    "No-Restrictions 🍽️",
    "Vegan 🥦",
    "Keto 🥩",
    "Vegetarian 🥕",
    "Pescatarian 🐟",
    "Gluten-Free 🍞🚫",
    "Animal-Based 🍖",
    
  ]);
  const [icks, setIcks] = useState<string[]>([
    "Bad Hygiene 🚫🧼",
    "Rude to Waitstaff 🍽️💢",
    "Always Late 🕒",
    "Too Loud 🔊",
    "Poor Communication 📵",
  ]);
  const [substances, setSubstances] = useState<string[]>([
    "Alcohol 🍷",
    "Smoking 🚬",
    "Cannabis 🌿",
    "Sober 🚫🍺",
    "Sober Curious 🤔🍹",
  ]);

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
    setZodiac(value);
    setSelectedZodiac(value);
  };
  useEffect(() => {
    let invalid = true;
    if (birthdayText && isValidDateFormat(birthdayText)) {
      const sign = calcZodiacFromDate(birthdayText);
      if (sign.length != 0) {
        invalid = false;
        setZodiacState(sign);
      }
    }
    if (invalid) {
      setZodiacState(ZodiacSign.BadBirthday);
      // console.log("Invalid or missing birthday text");
    }
  }, [birthdayText]);
  const [selectedPets, setSelectedPets] = useState<Set<string>>(new Set());
  const [selectedDiets, setSelectedDiets] = useState<Set<string>>(new Set());
  const [selectedIcks, setSelectedIcks] = useState<Set<string>>(new Set());
  const [selectedSubstances, setSelectedSubstances] = useState<Set<string>>(
    new Set()
  );

  // Setting an attribute as true (Used by addAttribute() and therefore HandleAddAttributePress() too)
  const setAttributeTrue = (
    attribute: string,
    setState: Dispatch<SetStateAction<Set<string>>>
  ) => {
    setState((prevSelected) => {
      const updatedSet = new Set(prevSelected);
      updatedSet.add(attribute); // Add the attribute, ensuring it's selected
      return updatedSet;
    });
  };

  // Selecting an attribute (Used by HandleAddAttributePress())
  const addAttribute = (
    newAttribute: string,
    attributeArray: string[],
    setAttribute: Dispatch<SetStateAction<any>>,
    selectedAttributeArray: Set<string>,
    setSelectedAttributes: Dispatch<SetStateAction<any>>
  ) => {
    const attribute = newAttribute.trim();

    if (
      !attributeArray.some((attr) => attr === attribute) && 
      !selectedAttributeArray.has(attribute)
    ) {
      setAttribute((prevAttributes) => {
        // Double-check in the update function to avoid race conditions
        if (!prevAttributes.includes(attribute)) {
          return [...prevAttributes, attribute];
        }
        return prevAttributes;
      });
    }
    setAttributeTrue(newAttribute.trim(), setSelectedAttributes);
  };

  // When the user clicks the plus to add a new attribute
  const HandleAddAttributePress = (
    attributeArray: string[],
    setAttribute: Dispatch<SetStateAction<any>>,
    selectedAttributeArray: Set<string>,
    setSelectedAttributes: Dispatch<SetStateAction<any>>
  ) => {
    setGlobalIsEditing(true);
    // Prompt user for the new attribute
    Alert.prompt(
      `Add Attribute`,
      `Enter a new attribute`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: (text) =>
            text &&
            addAttribute(
              text,
              attributeArray,
              setAttribute,
              selectedAttributeArray,
              setSelectedAttributes
            ),
        },
      ],
      "plain-text"
    );
  };

  // Individualized handler functions for toggling the eye icon state
  const handleEyePress = (setFunction: SetStateAction<any>) => {
    setGlobalIsEditing(true);
    setFunction((prevEyeIcon) => (prevEyeIcon === "eye" ? "eye-off" : "eye"));
  };

  const startEditing = () => {
    setGlobalIsEditing(true);
  };

  const setGlobalIsEditing = (value: boolean) => {
    setIsEditing(value);
    GlobalState.isEditingProfile = value;
  };
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfilePic, setIsLoadingProfilePic] = useState(false);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddProfilePic = async () => {
    try {
      setIsLoadingProfilePic(true);
      const userID = GlobalState.userID;
      if (!userID) {
        Alert.alert("Error", "User ID not found.");
        setIsLoadingProfilePic(false);
        return;
      }

     // Select photo from the library
     const profilePicUri = await selectMedia(MediaType.profilePic);
     if (!profilePicUri) {
      setIsLoadingProfilePic(false);
       return; // User canceled
     }

      // Upload the selected photo
      const uploadedProfilePicURL = await uploadMedia(userID, profilePicUri, MediaType.profilePic);

      if (uploadedProfilePicURL) {
        setProfilePic(uploadedProfilePicURL);
      }
    } catch (error) {
      console.error("Error adding profile pic:", error);
      Alert.alert("Error", "Could not add profile pic.");
    } finally {
      setIsLoadingProfilePic(false);
    }
  };


  const handleAddPhoto = async (index: number) => {
    try {
      setIsLoadingPhoto(true);
      const userID = GlobalState.userID;
      if (!userID) {
        Alert.alert("Error", "User ID not found.");
        setIsLoadingPhoto(false);
        return;
      }

      // Prevent exceeding the photo limit
    if (getPhotosLength(photos) >= 6) {
      // Alert.alert("Error", "You can only upload up to 6 photos.");
      setIsLoadingPhoto(false);
      return;
    }

      // Select photo from the library
      const photoUri = await selectMedia(MediaType.photo);
      if (!photoUri) {
        setIsLoadingPhoto(false);
        return; // User canceled
      }

      // Upload the selected photo
      const uploadedPhotoURL = await uploadMedia(userID, photoUri, MediaType.photo, index);

      if (uploadedPhotoURL) {
        const updatedPhotos = [...photos];
        updatedPhotos[index] = uploadedPhotoURL;
        setPhotos(updatedPhotos);
      }
    } catch (error) {
      console.error("Error adding photo:", error);
      Alert.alert("Error", "Could not add photo.");
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handleAddVideo = async () => {
    try {
      setIsLoadingVideo(true);
      const userID = GlobalState.userID;
      if (!userID) {
        Alert.alert("Error", "User ID not found.");
        setIsLoadingVideo(false);
        return;
      }

      // Select video from the library
      const videoUri = await selectMedia(MediaType.video);
      if (!videoUri) {
        setIsLoadingVideo(false);
        return; // User canceled
      }

      // Upload the vdeo
      const uploadedVideoURL = await uploadMedia(userID, videoUri, MediaType.video);

      if (uploadedVideoURL) {
        setVideo(uploadedVideoURL);
      }
    } catch (error) {
      console.error("Error adding video:", error);
      Alert.alert("Error", "Could not add video.");
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleUserRedirect = () => {
    GlobalState.isRegistering = true;
    router.push('/matchPreferences');
  };

  // Validation function
  const validateFields = () => {

    // this created a map where each field has a bool of it is empty or not

    // attribute: boolean
                // true meaning error
    const newErrors = { 
      profilePic: profilePic.length == 0,
      name: !nameText.trim(), // trims the string and if its empty then true for error
      birthday: !birthdayText.trim() || !isValidDateFormat(birthdayText),
      location: !locationText.trim(),
      pronouns: pronouns.length == 0,
      orientation: orientation.length == 0,
      languages: languages.length == 0,
      religions: religions.length == 0,
      educations: educations.length == 0,
      bio: !bioText.trim(),
      hometown: !hometownText.trim(),
      occupation: !occupationText.trim(),
      hobbies: hobbies.length == 0,
      musics: musics.length == 0,
      //zodiac
      pets: pets.length == 0,
      diets: diets.length == 0,
      icks: icks.length == 0,
      substances: substances.length == 0,
      photos: getPhotosLength(photos) <= 0,
    };

    setErrors(newErrors);

    // Check if any field is invalid
    const hasErrors = Object.values(newErrors).some((error) => error);
    if (hasErrors) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return false;
    }

    return true;
  };

  // Save function to update user profile
  const saveUserProfile = async () => {
    if (isLoadingPhoto || isLoadingProfilePic || isLoadingVideo || isSaving) {
      return;
    }
    const userID = GlobalState.userID;

    if (!userID) {
      Alert.alert(
        "Error",
        "No user ID found in GlobalState. Cannot save changes."
      );
      return;
    }

    if (validateFields()) {
      try {
        setIsSaving(true);

        const userRef = doc(db, "Users", userID);

        // Prepare data to update
        const updatedData = {
          name: nameText.trim(),
          birthday: birthdayText.trim(),
          location: locationText.trim(),
          bio: bioText.trim(),
          hometown: hometownText.trim(),
          occupation: occupationText.trim(),
          pronouns: selectedPronoun,
          orientation: selectedOrientation,
          languages: Array.from(selectedLanguages),
          religion: Array.from(selectedReligions),
          education: Array.from(selectedEducations),
          hobbies: Array.from(selectedHobbies),
          music: Array.from(selectedMusic),
          pets: Array.from(selectedPets),
          diet: Array.from(selectedDiets),
          icks: Array.from(selectedIcks),
          substances: Array.from(selectedSubstances),
          location_isVisible: locationEyeIcon === "eye",
          pronouns_isVisible: pronounsEyeIcon === "eye",
          orientation_isVisible: orientationEyeIcon === "eye",
          languages_isVisible: languageEyeIcon === "eye",
          religion_isVisible: religionEyeIcon === "eye",
          education_isVisible: educationEyeIcon === "eye",
          bio_isVisible: bioEyeIcon === "eye",
          hometown_isVisible: hometownEyeIcon === "eye",
          occupation_isVisible: occupationEyeIcon === "eye",
          hobbies_isVisible: hobbiesEyeIcon === "eye",
          music_isVisible: musicEyeIcon === "eye",
          zodiac_isVisible: zodiacEyeIcon === "eye",
          pets_isVisible: petsEyeIcon === "eye",
          diet_isVisible: dietEyeIcon === "eye",
          icks_isVisible: icksEyeIcon === "eye",
          substances_isVisible: substanceEyeIcon === "eye",
          photos_isVisible: photosEyeIcon === "eye",
          video_isVisible: videoEyeIcon === "eye",
        };

        if ((!photos || photos.length === 0) && !video && !profilePic) {
          console.error("No photos, video, or profile picture available for upload.");
          setIsSaving(false);
          return;
        }
        
        // Handle profile picture
        let permanentProfilePicURL = null;
        if (profilePic) {
          const fileExtension = profilePic.split("?")[0]?.split(".").pop()?.toLowerCase();
          const profilePicRef = ref(storage, `users/${userID}/profilePic/profilePic.${fileExtension}`);
        
          // Check if the profile picture already exists
          try {
            const existingProfilePicURL = await getDownloadURL(profilePicRef);
            console.log(`Profile picture already exists: ${existingProfilePicURL}`);
            permanentProfilePicURL = existingProfilePicURL;
          } catch (error) {
            if (error.code === "storage/object-not-found") {
              // Upload if the profile picture does not exist
              await uploadBytes(profilePicRef, await (await fetch(profilePic)).blob());
              permanentProfilePicURL = await getDownloadURL(profilePicRef);
              console.log(`Uploaded new profile picture: ${permanentProfilePicURL}`);
            } else {
              console.error("Error checking profile picture existence:", error);
              throw error;
            }
          }
        }
        
        const permanentPhotos = await Promise.all(
          photos.map(async (photo, i) => {
            const fileExtension = photo.split("?")[0]?.split(".").pop()?.toLowerCase();
            const photoRef = ref(storage, `users/${userID}/photos/photo${i}.${fileExtension}`);
        
            // Check if the photo already exists
            try {
              const existingURL = await getDownloadURL(photoRef);
              console.log(`Photo already exists: ${existingURL}`);
              setIsSaving(false);
              return existingURL;
            } catch (error) {
              if (error.code === "storage/object-not-found") {
                // Upload if the photo does not exist
                await uploadBytes(photoRef, await (await fetch(photo)).blob());
                const downloadURL = await getDownloadURL(photoRef);
                console.log(`Uploaded new photo: ${downloadURL}`);
                setIsSaving(false);
                return downloadURL;
              } else {
                console.error("Error checking photo existence:", error);
                throw error;
              }
            }
          })
        );

        // Handle the video
        let permanentVideoURL = null;
        if (video) {
          const fileExtension = video.split("?")[0]?.split(".").pop()?.toLowerCase();
          const videoRef = ref(storage, `users/${userID}/video/video.${fileExtension}`);
        
          // Check if the video already exists
          try {
            const existingVideoURL = await getDownloadURL(videoRef);
            console.log(`Video already exists: ${existingVideoURL}`);
            permanentVideoURL = existingVideoURL;
          } catch (error) {
            if (error.code === "storage/object-not-found") {
              // Upload if the video does not exist
              await uploadBytes(videoRef, await (await fetch(video)).blob());
              permanentVideoURL = await getDownloadURL(videoRef);
              console.log(`Uploaded new video: ${permanentVideoURL}`);
            } else {
              console.error("Error checking video existence:", error);
              throw error;
            }
          }
        }

        GlobalState.userProfilePic = permanentProfilePicURL || "";
        GlobalState.userPhotos = permanentPhotos || [];
        GlobalState.userVideo = permanentVideoURL || "";

        // Update Firestore document with media
        await updateDoc(userRef, {
          ...updatedData,
          profilePic: permanentProfilePicURL,
          photos: permanentPhotos,
          video: permanentVideoURL,
        });

        console.log("User profile saved with photos, video, and profile picture.", {
          photos: permanentPhotos,
          video: permanentVideoURL,
          profilePic: permanentProfilePicURL,
        });

        setGlobalIsEditing(false);
        // Alert.alert("Success", "Your profile has been saved successfully.");

        handleUserRedirect();

      } catch (error) {
        console.error("Error saving user profile:", error);
        Alert.alert("Error", "An error occurred while creating your profile.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // When user is editing registration and tries to hit the back button
  const cancelSave = async () => {
    await discardUnsavedMedia();
    clearAllFields();
    setGlobalIsEditing(false);
    await LogoutUserAsync();
    router.push("/");
  };

  const clearAllFields = () => {
    // Reset text fields
    setNameText("");
    setBirthdayText("");
    setLocationText("");
    setBioText("");
    setHometownText("");
    setOccupationText("");
    setSelectedPronoun("");
    setSelectedOrientation("");

    // Reset sets
    setSelectedLanguages(new Set());
    setSelectedReligions(new Set());
    setSelectedEducations(new Set());
    setSelectedHobbies(new Set());
    setSelectedMusic(new Set());
    setSelectedPets(new Set());
    setSelectedDiets(new Set());
    setSelectedIcks(new Set());
    setSelectedSubstances(new Set());

    setProfilePic("");
    setPhotos([]);
    setVideo("");

    // Reset visibility states
    setLocationEyeIcon("eye");
    setPronounsEyeIcon("eye");
    setOrientationEyeIcon("eye");
    setLanguageEyeIcon("eye");
    setReligionEyeIcon("eye");
    setEducationEyeIcon("eye");
    setBioEyeIcon("eye");
    setHometownEyeIcon("eye");
    setOccupationEyeIcon("eye");
    setHobbiesEyeIcon("eye");
    setMusicEyeIcon("eye");
    setZodiacEyeIcon("eye");
    setPetsEyeIcon("eye");
    setDietEyeIcon("eye");
    setIcksEyeIcon("eye");
    setSubstanceEyeIcon("eye");
    setPhotosEyeIcon("eye");
    setVideoEyeIcon("eye");
  };

  const discardUnsavedMedia = async () => {
    const userID = GlobalState.userID;
    if (!userID) return;
  
    try {
      const supportedImageExtensions = ['jpg', 'jpeg', 'png', 'tiff'];
      const supportedVideoExtensions = ['mp4', 'mov', 'avi', 'mkv'];

      // Delete profile picture
      for (const ext of supportedImageExtensions) {
        const profilePicRef = ref(storage, `users/${userID}/profilePic/profilePic.${ext}`);
        try {
          await deleteObject(profilePicRef);
          console.log(`Profile picture deleted: profilePic.${ext}`);
        } catch (error) {
          console.warn(`Profile picture file not found: profilePic.${ext}`);
        }
      }

      // Delete photos
      for (let i = 0; i < photos.length; i++) {
        for (const ext of supportedImageExtensions) {
          const photoRef = ref(storage, `users/${userID}/photos/photo${i}.${ext}`);
          try {
            await deleteObject(photoRef);
          } catch (error) {
            console.warn(`Photo file not found: photo${i}.${ext}`);
          }
        }
      }

      // Delete video
      for (const ext of supportedVideoExtensions) {
        const videoRef = ref(storage, `users/${userID}/video/video.${ext}`);
        try {
          await deleteObject(videoRef);
        } catch (error) {
          console.warn(`Video file not found: video.${ext}`);
        }
      }
  
      console.log("Unsaved photos discarded.");
      setProfilePic("");
      setPhotos([]);
      setVideo("");
    } catch (error) {
      console.error("Error discarding unsaved photos:", error);
    }
  };

  const fieldMapping = {
    name: setNameText,
    birthday: (birthdayString) => {
      setBirthdayText(birthdayString);
      setSelectedDate(stringToDate(birthdayString));
    },
    location: setLocationText,
    bio: setBioText,
    hometown: setHometownText,
    occupation: setOccupationText,
    pronouns: setSelectedPronoun,
    orientation: setSelectedOrientation,
    languages: (value) =>
      (value || []).forEach((item: string) =>
        addAttribute(item, languages, setLanguages, selectedLanguages, setSelectedLanguages)
      ),
    religion: (value) =>
      (value || []).forEach((item: string) =>
        addAttribute(item, religions, setReligions, selectedReligions, setSelectedReligions)
      ),
    education: (value) =>
      (value || []).forEach((item: string) =>
        addAttribute(item, educations, setEducations, selectedEducations, setSelectedEducations)
      ),
    hobbies: (value) =>
      (value || []).forEach((item: string) =>
        addAttribute(item, hobbies, setHobbies, selectedHobbies, setSelectedHobbies)
      ),
    music: (value) =>
      (value || []).forEach((item: string) =>
        addAttribute(item, musics, setMusics, selectedMusic, setSelectedMusic)
      ),
    pets: (value) =>
      (value || []).forEach((item: string) =>
        addAttribute(item, pets, setPets, selectedPets, setSelectedPets)
      ),
    diet: (value) =>
      (value || []).forEach((item: string) =>
        addAttribute(item, diets, setDiets, selectedDiets, setSelectedDiets)
      ),
    icks: (value) =>
      (value || []).forEach((item: string) =>
        addAttribute(item, icks, setIcks, selectedIcks, setSelectedIcks)
      ),
    substances: (value) =>
      (value || []).forEach((item: string) =>
        addAttribute(item, substances, setSubstances, selectedSubstances, setSelectedSubstances)
      ),
  };

  const visibilityMapping = {
    bio_isVisible: setBioEyeIcon,
    location_isVisible: setLocationEyeIcon,
    pronouns_isVisible: setPronounsEyeIcon,
    orientation_isVisible: setOrientationEyeIcon,
    languages_isVisible: setLanguageEyeIcon,
    religion_isVisible: setReligionEyeIcon,
    education_isVisible: setEducationEyeIcon,
    hobbies_isVisible: setHobbiesEyeIcon,
    music_isVisible: setMusicEyeIcon,
    zodiac_isVisible: setZodiacEyeIcon,
    pets_isVisible: setPetsEyeIcon,
    diet_isVisible: setDietEyeIcon,
    icks_isVisible: setIcksEyeIcon,
    substances_isVisible: setSubstanceEyeIcon,
    photos_isVisible: setPhotosEyeIcon,
    video_isVisible: setVideoEyeIcon,
    hometown_isVisible: setHometownEyeIcon,
    occupation_isVisible: setOccupationEyeIcon,
  };

// Fetch user profile from Firestore
const fetchUserProfile = async () => {
  const userID = GlobalState.userID; // Get user ID from GlobalState

  if (!userID) {
    // Alert.alert("Error", "No user ID found in GlobalState. Please log in.");
    await LogoutUserAsync();
    router.push("/");
    return;
  }

  try {
    const userRef = doc(db, "Users", userID);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();

      // Map Firestore fields to state variables
      Object.entries(fieldMapping).forEach(([field, setState]) => {
        if (userData[field] !== undefined) {
          setState(userData[field]);
        }
      });

      // Map visibility fields to state variables
      Object.entries(visibilityMapping).forEach(([field, setState]) => {
        const isVisible = userData[field];
        // This means if the isVisible is not set, it defaults to true, this is what we want on the profile and registration pages 
            // because that means that part of the profile was just created
        setState(isVisible === null || isVisible === undefined || isVisible ? "eye" : "eye-off");
      });

      // Fetch profile pic
      const userProfilePic = userData.profilePic || "";
      setProfilePic(userProfilePic);

      // Fetch photos array
      const userPhotos = userData.photos || [];
      setPhotos(userPhotos);

      // Fetch video
      const userVideo = userData.video || "";
      setVideo(userVideo);

      console.log("User Data:", userData);
    } else {
      console.error("User not found");
      // Alert.alert("Error", "User profile not found in Firestore.");
      await LogoutUserAsync();
      router.push("/");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Alert.alert(
    //   "Error",
    //   "An error occurred while fetching the user profile."
    // );
    await LogoutUserAsync();
    router.push("/");
  }
};


useEffect(() => {
    if (pathname === "/registration") {
      if (!GlobalState.isUserSignedIn || GlobalState.userID == "" || GlobalState.username == "") {
        router.push('/');
        return;
      }
      // clearAllFields();
      fetchUserProfile();
      setGlobalIsEditing(false);
    }
  }, [pathname]);

  return (
    <ScrollView style={profileStyles.background}>
      <Text style={profileStyles.bigText}>Let's get started!</Text>

      {/* Picture + Name */}
      <View style={profileStyles.profilePicContainer}>
        <Text style={{ color: "red", paddingLeft: 120, marginBottom: -20 }}>*</Text>
        <TouchableOpacity onPress={handleAddProfilePic}>
          {isLoadingProfilePic ? (
            <ActivityIndicator size="large" color="grey" style={[profileStyles.loading, {height: 130, marginTop: 20}]} />
          ) : profilePic ? (
            <Image
              source={{ uri: profilePic }}
              style={profileStyles.blankProfileImage}
            />
          ) : (
            <Image
              source={require("../assets/images/BlankProfilePicTAKEPHOTO.png")}
              style={profileStyles.blankProfileImage}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* First container */}
      <View style={profileStyles.container}>
        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Name:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
        </View>
        <TextInput
          style={[
            profileStyles.textField,
            nameText && nameText.length > 0
              ? profileStyles.selectedTextBox
              : null,
          ]}
          value={nameText}
          onFocus={startEditing}
          onChangeText={(newText) => setNameText(newText)}
        />

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Birthday:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
        </View>
        <View
          style={[
            profileStyles.dateContainer,
            birthdayText && birthdayText.length > 0
              ? profileStyles.selectedDateContainer
              : null,
          ]}
        >
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          style={profileStyles.datePicker}
          themeVariant={birthdayText && birthdayText.length > 0 ? "dark" : "light"}
          textColor={birthdayText && birthdayText.length > 0 ? "dark" : "light"}
          onChange={(event, date) => {
            if (date) {
              handleConfirmDate(date);
            }
          }}
        />
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Location:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <EyeToggle
              icon={locationEyeIcon}
              onPress={() => handleEyePress(setLocationEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <TextInput
          style={[
            profileStyles.textField,
            locationText && locationText.length > 0
              ? profileStyles.selectedTextBox
              : null,
          ]}
          value={locationText}
          onFocus={startEditing}
          onChangeText={(newText) => setLocationText(newText)}
        />

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Pronouns:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <EyeToggle
              icon={pronounsEyeIcon}
              onPress={() => handleEyePress(setPronounsEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <SinglePressableBubbleGroup
            labels={pronouns}
            selectedLabel={selectedPronoun}
            defaultAttribute="Other"
            setLabelState={setSelectedPronoun}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Orientation:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <EyeToggle
              icon={orientationEyeIcon}
              onPress={() => handleEyePress(setOrientationEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <SinglePressableBubbleGroup
            labels={orientation}
            selectedLabel={selectedOrientation}
            defaultAttribute=""
            setLabelState={setSelectedOrientation}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Languages:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <View style={profileStyles.eyeContainer}>
              <Pressable
                onPress={() =>
                  HandleAddAttributePress(
                    languages,
                    setLanguages,
                    selectedLanguages,
                    setSelectedLanguages
                  )
                }
              >
                <Feather
                  name="plus-circle"
                  size={28}
                  color={Colors.darkPurple}
                />
              </Pressable>
            </View>
            <EyeToggle
              icon={languageEyeIcon}
              onPress={() => handleEyePress(setLanguageEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <MultiPressableBubblesGroup
            labels={languages}
            selectedLabels={selectedLanguages}
            setLabelState={setSelectedLanguages}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Religion:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <View style={profileStyles.eyeContainer}>
              <Pressable
                onPress={() =>
                  HandleAddAttributePress(
                    religions,
                    setReligions,
                    selectedReligions,
                    setSelectedReligions
                  )
                }
              >
                <Feather
                  name="plus-circle"
                  size={28}
                  color={Colors.darkPurple}
                />
              </Pressable>
            </View>
            <EyeToggle
              icon={religionEyeIcon}
              onPress={() => handleEyePress(setReligionEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <MultiPressableBubblesGroup
            labels={religions}
            selectedLabels={selectedReligions}
            setLabelState={setSelectedReligions}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Education:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <View style={profileStyles.eyeContainer}>
              <Pressable
                onPress={() =>
                  HandleAddAttributePress(
                    educations,
                    setEducations,
                    selectedEducations,
                    setSelectedEducations
                  )
                }
              >
                <Feather
                  name="plus-circle"
                  size={28}
                  color={Colors.darkPurple}
                />
              </Pressable>
            </View>
            <EyeToggle
              icon={educationEyeIcon}
              onPress={() => handleEyePress(setEducationEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <MultiPressableBubblesGroup
            labels={educations}
            selectedLabels={selectedEducations}
            setLabelState={setSelectedEducations}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>
      </View>

      <View style={profileStyles.separatorLine}></View>

      {/* Second container */}
      <View style={profileStyles.container}>
        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Bio:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <EyeToggle
              icon={bioEyeIcon}
              onPress={() => handleEyePress(setBioEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <TextInput
          style={[
            profileStyles.textBox,
            bioText && bioText.length > 0
              ? profileStyles.selectedTextBox
              : null,
          ]}
          value={bioText}
          onFocus={startEditing}
          onChangeText={(newText) => setBioText(newText)}
          multiline={true}
        />
      </View>

      <View style={profileStyles.separatorLine}></View>

      {/* Third container */}
      <View style={profileStyles.container}>
        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Hometown:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <EyeToggle
              icon={hometownEyeIcon}
              onPress={() => handleEyePress(setHometownEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <TextInput
          style={[
            profileStyles.textField,
            hometownText && hometownText.length > 0
              ? profileStyles.selectedTextBox
              : null,
          ]}
          value={hometownText}
          onFocus={startEditing}
          onChangeText={(newText) => setHometownText(newText)}
        />

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Occupation:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <EyeToggle
              icon={occupationEyeIcon}
              onPress={() => handleEyePress(setOccupationEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <TextInput
          style={[
            profileStyles.textField,
            occupationText && occupationText.length > 0
              ? profileStyles.selectedTextBox
              : null,
          ]}
          value={occupationText}
          onFocus={startEditing}
          onChangeText={(newText) => setOccupationText(newText)}
        />

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Hobbies:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <View style={profileStyles.eyeContainer}>
              <Pressable
                onPress={() =>
                  HandleAddAttributePress(
                    hobbies,
                    setHobbies,
                    selectedHobbies,
                    setSelectedHobbies
                  )
                }
              >
                <Feather
                  name="plus-circle"
                  size={28}
                  color={Colors.darkPurple}
                />
              </Pressable>
            </View>
            <EyeToggle
              icon={hobbiesEyeIcon}
              onPress={() => handleEyePress(setHobbiesEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <MultiPressableBubblesGroup
            labels={hobbies}
            selectedLabels={selectedHobbies}
            setLabelState={setSelectedHobbies}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Music:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <View style={profileStyles.eyeContainer}>
              <Pressable
                onPress={() =>
                  HandleAddAttributePress(musics, setMusics, selectedMusic, setSelectedMusic)
                }
              >
                <Feather
                  name="plus-circle"
                  size={28}
                  color={Colors.darkPurple}
                />
              </Pressable>
            </View>
            <EyeToggle
              icon={musicEyeIcon}
              onPress={() => handleEyePress(setMusicEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <MultiPressableBubblesGroup
            labels={musics}
            selectedLabels={selectedMusic}
            setLabelState={setSelectedMusic}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Zodiac Sign:</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <EyeToggle
              icon={zodiacEyeIcon}
              onPress={() => handleEyePress(setZodiacEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <Pressable
            style={[
              profileStyles.pressableBubble,
              selectedZodiac !== "Enter Birthday for Zodiac Sign" &&
                profileStyles.selectedBubble,
            ]}
          >
            <Text
              style={[
                profileStyles.pressableText,
                selectedZodiac !== "Enter Birthday for Zodiac Sign" &&
                  profileStyles.selectedBubbleText,
              ]}
            >
              {zodiac}
            </Text>
          </Pressable>
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Pets:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <View style={profileStyles.eyeContainer}>
              <Pressable
                onPress={() =>
                  HandleAddAttributePress(pets, setPets, selectedPets, setSelectedPets)
                }
              >
                <Feather
                  name="plus-circle"
                  size={28}
                  color={Colors.darkPurple}
                />
              </Pressable>
            </View>
            <EyeToggle
              icon={petsEyeIcon}
              onPress={() => handleEyePress(setPetsEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <MultiPressableBubblesGroup
            labels={pets}
            selectedLabels={selectedPets}
            setLabelState={setSelectedPets}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Diet:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <View style={profileStyles.eyeContainer}>
              <Pressable
                onPress={() =>
                  HandleAddAttributePress(diets, setDiets, selectedDiets, setSelectedDiets)
                }
              >
                <Feather
                  name="plus-circle"
                  size={28}
                  color={Colors.darkPurple}
                />
              </Pressable>
            </View>
            <EyeToggle
              icon={dietEyeIcon}
              onPress={() => handleEyePress(setDietEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <MultiPressableBubblesGroup
            labels={diets}
            selectedLabels={selectedDiets}
            setLabelState={setSelectedDiets}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Substances:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <EyeToggle
              icon={substanceEyeIcon}
              onPress={() => handleEyePress(setSubstanceEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <MultiPressableBubblesGroup
            labels={substances}
            selectedLabels={selectedSubstances}
            setLabelState={setSelectedSubstances}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>

        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Icks:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <View style={profileStyles.eyeContainer}>
              <Pressable
                onPress={() =>
                  HandleAddAttributePress(icks, setIcks, selectedIcks, setSelectedIcks)
                }
              >
                <Feather
                  name="plus-circle"
                  size={28}
                  color={Colors.darkPurple}
                />
              </Pressable>
            </View>
            <EyeToggle
              icon={icksEyeIcon}
              onPress={() => handleEyePress(setIcksEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.pressableContainer}>
          <MultiPressableBubblesGroup
            labels={icks}
            selectedLabels={selectedIcks}
            setLabelState={setSelectedIcks}
            styles={profileStyles}
            startEditing={startEditing}
          />
        </View>
      </View>


      <View style={profileStyles.separatorLine}></View>

      {/* Fourth container: Photos */}
      <View style={profileStyles.container}>
        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Photos:</Text>
          <Text style={{ color: "red", marginLeft: 2 }}>*</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <EyeToggle
              icon={photosEyeIcon}
              onPress={() => handleEyePress(setPhotosEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.photosContainer}>
          {photos.map((photo, index) => (getPhotosLength(photos) > index &&
            <View style={profileStyles.photoShadow} key={index}>
              {photo && (
                <Image
                  style={profileStyles.photo}
                  source={{uri: photo}}
                />
              )}
            </View>
          ))}
          {(!isLoadingPhoto && getPhotosLength(photos) < 6) && (
            <TouchableOpacity style={profileStyles.svgContainer} onPress={() => handleAddPhoto(getPhotosLength(photos))}>
              <AddPhotoSVG width="100%" height="100%" />
            </TouchableOpacity>
          )}
          {isLoadingPhoto && (
            <ActivityIndicator size="large" color="gray" style={profileStyles.loading} />
          )}
        </View>
      </View>

      <View style={profileStyles.separatorLine}></View>

      {/* Fifth container: Video */}
      <View style={profileStyles.container}>
        <View style={profileStyles.labelContainer}>
          <Text style={profileStyles.labelText}>Personal Video:</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <EyeToggle
              icon={videoEyeIcon}
              onPress={() => handleEyePress(setVideoEyeIcon)}
              styles={profileStyles}
            />
          </View>
        </View>
        <View style={profileStyles.photosContainer}>
          {video.length > 0 ? (
            <View style={profileStyles.photoShadow}>
            {video && (
              <Video
                style={profileStyles.video}
                source={{ uri: video }}
                isLooping={true}
                shouldPlay={true}
                volume={0.0}
              />
            )}
          </View>
          ) : (
            !isLoadingVideo && (
            <TouchableOpacity style={profileStyles.svgContainer} onPress={() => handleAddVideo()} >
              <AddVideoSVG width="100%" height="100%" />
            </TouchableOpacity>
            )
          )}
          {isLoadingVideo && (
            <ActivityIndicator size="large" color="gray" style={profileStyles.loading} />
          )}
        </View>
      </View>

      <View style={profileStyles.buttonContainer}>
        <Pressable style={profileStyles.saveButton} onPress={saveUserProfile}>
          {isSaving ? (
            <ActivityIndicator size="large" color="white" style={{paddingTop: 10}} />
          ) : (
            <Text style={profileStyles.buttonText}>Save</Text>
          )}
        </Pressable>

        <Pressable style={profileStyles.cancelButton} onPress={async () => { await cancelSave() }}>
          <Text style={profileStyles.buttonText}>Cancel</Text>
        </Pressable>
      </View>

      <View style={{ padding: "8%" }}></View>
    </ScrollView>
  );
}
