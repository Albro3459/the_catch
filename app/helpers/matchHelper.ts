import { db } from "@/firebaseConfig";
import { ClearGlobalStateMatchData, GlobalState } from "@/GlobalState";
import { runTransaction, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where, addDoc, CollectionReference, DocumentData, getDocsFromServer } from "firebase/firestore";
import { Alert } from "react-native";
import { Storage } from "./storageHelper";
import { router } from "expo-router";

export const fetchMatchedUserID = async (userID: string) => {
    try {
        // Reference to the Matches collection
        const matchesRef = collection(db, "Matches");

        // Query for matches where userID is user1_id
        const queryUser1 = query(matchesRef, where("isDeleted", "==", false), where("user1_id", "==", userID));
        const querySnapshot1 = await getDocsFromServer(queryUser1);

        // Query for matches where userID is user2_id
        const queryUser2 = query(matchesRef, where("isDeleted", "==", false), where("user2_id", "==", userID));
        const querySnapshot2 = await getDocsFromServer(queryUser2);

        // Combine results from both queries
        const allMatches = [...querySnapshot1.docs, ...querySnapshot2.docs];

        if (allMatches.length === 0) {
            console.log("No match documents found.");
            ClearGlobalStateMatchData();
            return null;
        }

        const matchDoc = allMatches.find(doc => {
            const data = doc.data();
            return !data.isDeleted; // Skip matches marked as deleted
        });

        if (!matchDoc) {
            console.log("No active matches found.");
            // Alert.alert("Info", "No active matches found.");
            ClearGlobalStateMatchData();
            return null;
        }

        GlobalState.matchID = matchDoc.id;

        const matchData = matchDoc.data();          

        // Determine the matchID by finding the other user in the match
        const matchedUserID =
            matchData.user1_id === userID
                ? matchData.user2_id
                : matchData.user1_id;

        return matchedUserID;
    } catch (error) {
        console.error("Error fetching match ID:", error);
        ClearGlobalStateMatchData();
        return null;
    }
};

export const createMatch = async (userID: string, username: string) : Promise<boolean> => {
    try {
        // Reference to the Matches collection
        const matchesRef = collection(db, "Matches");

        // Query for matches where userID is user1_id
        const queryUser1 = query(matchesRef, where("isDeleted", "==", false), where("user1_id", "==", userID));
        const querySnapshot1 = await getDocsFromServer(queryUser1);

        // Query for matches where userID is user2_id
        const queryUser2 = query(matchesRef, where("isDeleted", "==", false), where("user2_id", "==", userID));
        const querySnapshot2 = await getDocsFromServer(queryUser2);

        // Combine results from both queries
        const allMatches = [...querySnapshot1.docs, ...querySnapshot2.docs];

        if (allMatches.length !== 0) {
            console.log("User is already matched.");
            return false;
        }

        const matchDoc = allMatches.find(doc => {
            const data = doc.data();
            return !data.isDeleted; // Skip matches marked as deleted
        });

        if (matchDoc) {
            console.log("User is matched already..");
            GlobalState.matchID = "";
            return null;
        }

        const usersCollectionRef = collection(db, "Users");
        // Query for a document where 'username' matches inputUsername
        const q = query(
          usersCollectionRef,
          where("username", "!=", username.toLowerCase()),
          where("isRegistered", "==", true),
          where("isMatched", "==", false),
          orderBy("username")
        );
        const querySnapshot = await getDocsFromServer(q);
  
        if (querySnapshot.empty) {
            console.log("No other available users.");
            return false;
        }

        // get a random user id from the list in range of 0 - the length of the list
        const randomIndex = Math.floor(Math.random() * querySnapshot.docs.length);
        const randomUserDoc = querySnapshot.docs[randomIndex];

        if (!randomUserDoc) {
            console.log("Failed to select a random user.");
            return false;
        }

        const userIDofFutureMatch = randomUserDoc.id;

        const newMatch = {
            user1_id: userID,
            user2_id: userIDofFutureMatch,
            compatibility_score: null,
            revealGroups: [],
            isDeleted: false
        }

        const newMatchRef = doc(matchesRef); // Automatically generates a unique ID
        await setDoc(newMatchRef, newMatch);

        const matchID = newMatchRef.id;
        GlobalState.matchID = matchID;

        // Update isMatched for both users
        const users = [userID, userIDofFutureMatch];
        for (const user of users) {
            const userRef = doc(db, "Users", user);
            try {
                // Directly update the isMatched field
                await updateDoc(userRef, { isMatched: true });
                console.log(`User ${user} marked as matched.`);
            } catch (error) {
                console.error(`Failed to update isMatched for user ${user}:`, error);
            }
        }

        // Create a new chat with the same match ID
        const chatRef = doc(db, "Chats", GlobalState.matchID);
        const newChat = {
            user1_id: userID,
            user1MessageCount: 0,
            user2_id: userIDofFutureMatch,
            user2MessageCount: 0,
            promptSent: false,
            revealSent: false,
            systemMessageCount: 0,
            isDeleted: false
        };
        await setDoc(chatRef, newChat);

        const messagesRef = collection(chatRef, "Messages");

        await SendInitialMessage(messagesRef, userID, userIDofFutureMatch);
        await updateDoc(chatRef, { systemMessageCount: 1 });

        console.log(`New chat created for matchID: ${matchID}`);
        console.log(`New match between: ${GlobalState.userID} and ${userIDofFutureMatch}`);

        return true;
    } catch (error) {
        console.error("Error fetching user ID:", error);
        return false;
    }
};


export const breakUpWithMatchID = async (matchID) => {
  try {
    if (!matchID) {
      console.warn("No matchID provided.");
      return;
    }

    const matchRef = doc(db, "Matches", matchID);
    const chatRef = doc(db, "Chats", matchID);

    await runTransaction(db, async (transaction) => {
      const matchSnapshot = await transaction.get(matchRef);
      if (!matchSnapshot.exists()) {
        ClearGlobalStateMatchData();
        throw new Error("Match not found");
      }

      const matchData = matchSnapshot.data();
      const users = [matchData.user1_id, matchData.user2_id];

      if (!matchData.user1_id || !matchData.user2_id) {
        ClearGlobalStateMatchData();
        throw new Error("One or both user IDs are missing in match data.");
      }

      // Update isMatched for both users
      users.forEach((user) => {
        const userRef = doc(db, "Users", user);
        transaction.update(userRef, { isMatched: false });
        console.log(`User ${user} marked as not matched.`);
      });

      // Mark match and chat as deleted
      transaction.update(matchRef, { isDeleted: true });
      transaction.update(chatRef, { isDeleted: true });
    });

    ClearGlobalStateMatchData();
    // await Storage.setItem("alertShown", "false");

    console.log(`Match and Chat with ID ${matchID} have been deleted.`);
    router.push("/unmatched");
  } catch (error) {
    console.error("Error deleting match:", error);
    ClearGlobalStateMatchData();
  }
};

export const SendInitialMessage = async (messagesRef: CollectionReference<DocumentData, DocumentData>, user1ID: string, user2ID: string) => {
    // Send the initial system message
    await addDoc(messagesRef, {
        text: "Would you rather lose all sense of taste or become deaf?",
        sender: "0", // System message
        timestamp: new Date(),
        targets: [user1ID, user2ID],
    });

    console.log('Initial chat message sent');
}

export const RevealPartsOfProfile = async (matchID: string, groups: string[]) => {
    try {
        console.log(`For match ${matchID}, revealing ${groups.length === 0 ? "NONE" : groups.join(", ")}`);
        const matchesRef = collection(db, "Matches");
    
        // Query for the match
        const matchesQuery = query(matchesRef, where("isDeleted", "==", false));
        const matchesQuerySnapshot = await getDocsFromServer(matchesQuery);
    
        const matchDoc = matchesQuerySnapshot.docs.find((doc) => doc.id === matchID);
    
        if (!matchDoc) {
            console.log("Match not found.");
            return false;
        }
    
        const matchData = matchDoc.data();
        if (!matchData) {
            console.log("Invalid match data.");
            return false;
        }

        const currGroups = matchData.revealGroups || [];
    
        // Update groups
        const updatedGroups = groups.length === 0 ? [] 
                                : [...new Set([...currGroups, ...groups])];
        const matchDocRef = doc(db, "Matches", matchID);
    
        await updateDoc(matchDocRef, { revealGroups: updatedGroups });

        GlobalState.groupsRevealed = updatedGroups;
    
        console.log(`Match ${matchID} has now revealed groups: ${groups.length === 0 ? "NONE" : updatedGroups.join(", ")}.`);
        return true;
    } catch (error) {
      console.error("Error revealing parts of profile:", error);
      return false;
    }
};

export default {};