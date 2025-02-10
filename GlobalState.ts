import { collection, doc, getDoc, getDocs, getDocsFromServer, query, setDoc, where } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

export const GlobalState = {
    username: "",
    userID: "",
    docData: null,
    userProfilePic: "",
    userPhotos: [],
    userVideo: "",

    groupsRevealed:[],

    matchID: "",
    matchName: "",
    matchProfilePic: "",
    isMatchProfilePicRevealed: false,
    matchPhotos: [],
    matchVideo: "",

    matchAnimation: require("./assets/images/matchAnimation.gif"),
    appLogo: require("./assets/images/TheCatchLogo.png"),
    appNameImage: require("./assets/images/TheCatchText.png"),

    isUserSignedIn: false,

    isMatched: false,
    isMatching: false,

    isEditingProfile: false,

    isRegistered: false,
    isRegistering: false,

    isSimulatingTimer: false,

    landingPageUnsubscribeUser: null,
    landingPageUnsubscribeMatch: null,
    unmatchedUnsubscribeUser: null,
    chatPageUnsubscribeMatch: null,
    layoutUnsubscribeMatchProfilePic: null,
};

export const ClearGlobalState = () => {
    GlobalState.username = "";
    GlobalState.userID = "";
    GlobalState.docData = null;
    GlobalState.userProfilePic = "";
    GlobalState.userPhotos = [];
    GlobalState.userVideo = "";

    GlobalState.groupsRevealed = [];

    GlobalState.matchID = "";
    GlobalState.matchName = "";
    GlobalState.matchProfilePic = "";
    GlobalState.isMatchProfilePicRevealed = false;
    GlobalState.matchPhotos = [];
    GlobalState.matchVideo = "";

    GlobalState.matchAnimation = require("./assets/images/matchAnimation.gif");
    GlobalState.appLogo = require("./assets/images/TheCatchLogo.png");
    GlobalState.appNameImage = require("./assets/images/TheCatchText.png");

    GlobalState.isUserSignedIn = false;

    GlobalState.isMatched = false;
    GlobalState.isMatching = false;

    GlobalState.isEditingProfile = false;

    GlobalState.isRegistered = false;
    GlobalState.isRegistering = false;

    GlobalState.isSimulatingTimer = false;

    UnsubscribeFromAllListeners();
};

export const ClearGlobalStateUsersData = () => {
    GlobalState.userProfilePic = "";
    GlobalState.userPhotos = [];
    GlobalState.userVideo = "";

    GlobalState.groupsRevealed = [];

    GlobalState.matchID = "";
    GlobalState.matchName = "";
    GlobalState.matchProfilePic = "";
    GlobalState.isMatchProfilePicRevealed = false;
    GlobalState.matchPhotos = [];
    GlobalState.matchVideo = "";
    GlobalState.isMatched = false;
    GlobalState.isMatching = false;

    UnsubscribeFromAllListeners();
};

export const ClearGlobalStateMatchData = () => {
    GlobalState.groupsRevealed = [];

    GlobalState.matchID = "";
    GlobalState.matchName = "";
    GlobalState.matchProfilePic = "";
    GlobalState.isMatchProfilePicRevealed = false;
    GlobalState.matchPhotos = [];
    GlobalState.matchVideo = "";
    GlobalState.isMatched = false;
    GlobalState.isMatching = false;

    if (GlobalState.unmatchedUnsubscribeUser) {
        GlobalState.unmatchedUnsubscribeUser();
        GlobalState.unmatchedUnsubscribeUser = null;
        console.log("UnmatchedPage Match listener unsubscribed.");
    }
    // if (GlobalState.chatPageUnsubscribeMatch) {
    //     GlobalState.chatPageUnsubscribeMatch();
    //     GlobalState.chatPageUnsubscribeMatch = null;
    //     console.log("Chat Page: Match listener unsubscribed.");
    // }
};

export const UnsubscribeFromAllListeners = () => {
    // Unsubscribe from all listeners
    if (GlobalState.landingPageUnsubscribeUser) {
        GlobalState.landingPageUnsubscribeUser();
        GlobalState.landingPageUnsubscribeUser = null;
        console.log("LandingPage User listener unsubscribed.");
    }
    if (GlobalState.landingPageUnsubscribeMatch) {
        GlobalState.landingPageUnsubscribeMatch();
        GlobalState.landingPageUnsubscribeMatch = null;
        console.log("LandingPage Match listener unsubscribed.");
    }
    if (GlobalState.unmatchedUnsubscribeUser) {
        GlobalState.unmatchedUnsubscribeUser();
        GlobalState.unmatchedUnsubscribeUser = null;
        console.log("UnmatchedPage Match listener unsubscribed.");
    }
    if (GlobalState.chatPageUnsubscribeMatch) {
        GlobalState.chatPageUnsubscribeMatch();
        GlobalState.chatPageUnsubscribeMatch = null;
        console.log("Chat Page: Match listener unsubscribed.");
    } 
    if (GlobalState.layoutUnsubscribeMatchProfilePic) {
        GlobalState.layoutUnsubscribeMatchProfilePic();
        GlobalState.layoutUnsubscribeMatchProfilePic = null;
        console.log("_layout: Match profile pic listener unsubscribed.");
    }

    console.log("Unsubscribed from all listeners");
};

export const listenToAuthChanges = (
    onLogin: (user: any) => void,
    onLogout: () => void
  ): (() => void) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email || "unknown@example.com";
        console.log("User is logged in:", email.split('@')[0]);
        onLogin(user);
      } else {
        console.log("User is logged out.");
        onLogout();
      }
    });
  
    return unsubscribe;
};

export const LogInUserAuthAsync = async (user) => {

    const userId = user.uid;

    const email = user.email || "unknown@example.com"; // Ensure email exists
    const username = email.split('@')[0].toLowerCase();

    const userDoc = await getDoc(doc(db, "Users", userId));
    // This shouldn't be hit
    if (!userDoc.exists()) {
        console.error("No matching user found in Firestore.");
        return; // User exists in Auth but not in Firestore
    }

    const userData = userDoc.data();
    console.log("User data:", userData);

    // Update GlobalState
    GlobalState.isUserSignedIn = true;
    GlobalState.username = username;
    GlobalState.userID = userId;
    GlobalState.docData = userData;
    GlobalState.isEditingProfile = false;
    GlobalState.isRegistered = userData?.isRegistered;

    console.log(`Logged in User: ${GlobalState.username}, with ID: ${GlobalState.userID}`);
};

export const LogInUserAsync = async (username: string, password: string) : Promise<[number, string?, boolean?]> => { 
    username = username.toLocaleLowerCase().trim(); // trim whitespace before and after just in case: " user name " => "user name"
    try {
        // Derive the placeholder email from the username
        const placeholderEmail = `${username.toLowerCase()}@example.com`;

        // Authenticate with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, placeholderEmail, password);

        // Get the Firebase UID
        const userId = userCredential.user.uid;

        // Fetch the user's Firestore document
        const userDoc = await getDoc(doc(db, "Users", userId));

        if (!userDoc.exists()) {
            console.error("No matching user found in Firestore.");
            return [-1, null, null]; // User exists in Auth but not in Firestore
        }

        const userData = userDoc.data();
        console.log("User data:", userData);

        // Update GlobalState
        GlobalState.isUserSignedIn = true;
        GlobalState.username = username;
        GlobalState.userID = userId;
        GlobalState.docData = userData;
        GlobalState.isEditingProfile = false;
        GlobalState.isRegistered = userData?.isRegistered;

        console.log(`Logged in User: ${GlobalState.username}, with ID: ${GlobalState.userID}`);

        return [0, username, userData?.isRegistered || false]; // false just in case field isn't set

    } catch (error) {
        console.error("Error signing in:", error);
        return [-2, null, null];
    }
};

export const LogoutUserAsync = async (): Promise<void> => {
    // Clear GlobalState unconditionally
    console.log(`Logging out User: ${GlobalState.username}, with ID: ${GlobalState.userID}`);

    UnsubscribeFromAllListeners();

    ClearGlobalState();

    try {
        // Attempt to log out from Firebase Authentication
        await signOut(auth);
        console.log("User successfully logged out of Firebase.");
    } catch (error) {
        console.error("Error logging out of Firebase:", error);
    }
};

export const SignUpUserAsync = async (username: string, password: string) : Promise<[number, string?]> => { 
    username = username.trim(); // trim whitespace before and after just in case: " user name " => "user name"
    try {
        // Create new user
        // Reference the 'Users' collection
        const usersCollectionRef = collection(db, "Users");
        // Query for a document where 'username' matches inputUsername
        const q = query(
          usersCollectionRef,
          where("username", "==", username.toLowerCase())
        );
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
            // If no user found, create a new one

            // Create a Firebase Auth account
            const placeholderEmail = `${username.toLowerCase()}@example.com`;
            const userCredential = await createUserWithEmailAndPassword(auth, placeholderEmail, password);

            // Get the Firebase UID
            const userId = userCredential.user.uid;

            // Add additional user data to Firestore
            const newUserData = {
                username: username.toLowerCase(),
                email: placeholderEmail,
                isRegistered: false, // User isn't fully registered yet
                isMatched: false,
            };

            await setDoc(doc(usersCollectionRef, userId), newUserData);

            // Update GlobalState
            GlobalState.isUserSignedIn = true;
            GlobalState.username = username;
            GlobalState.userID = userId;
            GlobalState.docData = newUserData;
            GlobalState.isEditingProfile = false;
            GlobalState.isRegistered = false;

            console.log(`Signed up User: ${GlobalState.username}, with ID: ${GlobalState.userID}`);

            return [0, username];
  
        } else {
          console.error("Error signing up:", "User already exists");
          return [-1, null];
        }
      } catch (error) {
        console.error("Error signing up:", error);
        return [-2, null];
      }
}

export const DoesUserAlreadyExist = async (username: string): Promise<boolean | null> => {
    username = username.trim(); // trim whitespace before and after just in case: " user name " => "user name"
    try {
        // Reference the 'Users' collection
        const usersCollectionRef = collection(db, "Users");
        // Query for a document where 'username' matches inputUsername
        const q = query(
          usersCollectionRef,
          where("username", "==", username)
        );
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
            return true; // User already exists
        }
        else {
            return false; //User doesn't exist
        }
    } catch (error) {
        console.error("Error checking if user exists:", error);
        return null;
    }
};

export const IsUserRegisteredAsync = async (username: string): Promise<boolean | null> => {
    username = username.trim(); // trim whitespace before and after just in case: " user name " => "user name"
    try {
        // Reference the 'Users' collection
        const usersCollectionRef = collection(db, "Users");
        // Query for a document where 'username' matches inputUsername
        const q = query(
          usersCollectionRef,
          where("username", "==", username)
        );
        const querySnapshot = await getDocsFromServer(q);
  
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            
            return userData?.isRegistered || false; // false just in case field isn't set
        }
        else {
            return false; //User doesn't exist
        }
    } catch (error) {
        console.error("Error checking if user exists:", error);
        return null;
    }
};