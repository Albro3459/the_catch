import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Pressable,
  Image,
} from "react-native";
import { db } from "@/firebaseConfig";
import {
  ClearGlobalStateMatchData,
  GlobalState,
  LogoutUserAsync,
} from "@/GlobalState";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDocs,
  limit,
  runTransaction,
} from "firebase/firestore";

import { Colors } from "@/constants/Colors";
import {
  fetchMatchedUserID,
  RevealPartsOfProfile,
} from "./helpers/matchHelper";

import { router, useNavigation, usePathname } from "expo-router";
import { getRandomPrompts } from "./helpers/randomGeneratorHelper";
import useIsMatchProfilePicRevealed from "./helpers/listenerHelpers";
import { profileStyles } from "@/styles/profileStyles";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const ChatScreen = () => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [nameText, setNameText] = useState<string>(GlobalState.matchName);

  const lastSendMessageTimeRef = useRef(0);

  const prompts = [
    "about their interest in R&B Music!",
    "about their pet(s)!",
    "about their Gym hobby!",
    "about their Hometown!",
  ];

  let chatSuggestions = getRandomPrompts(prompts);
  let chatSuggestionsIndex = 0;

  const reveals = [[], ["A"], ["A", "B"], ["A", "B", "C"]];
  let revealsIndex = 0;

  // Function to add message
  const sendMessage = async () => {
    if (!GlobalState.matchID || GlobalState.matchID.trim() === "") {
      console.error("Invalid match ID. Cannot fetch messages.");
      return;
    }
    let messagesRef = collection(db, "Chats", GlobalState.matchID, "Messages");

    const now = Date.now();

    // Check if 0.5 seconds have passed since the last message
    if (now - lastSendMessageTimeRef.current < 500) {
      return; // Do not send the message
    }
    if (inputText.trim()) {
      try {
        setInputText("");
        lastSendMessageTimeRef.current = now;
        await addDoc(messagesRef, {
          text: inputText,
          sender: GlobalState.userID,
          timestamp: new Date(),
        });
        await handleMessageCountAndPrompt(GlobalState.userID); // Check if a system prompt is needed
      } catch (error) {
        console.error("Error sending message!", error);
      }
    }
  };

  // Render chat bubble
  const renderMessage = ({ item }) => (
    // Determines which side the chat bubble is on
    <View
      style={[
        styles.messageBubble,
        item.id === "invisible"
          ? styles.invisibleBubble
          : item.sender === GlobalState.userID
          ? styles.yourMessage
          : item.sender === "0" &&
            Array.isArray(item.targets) &&
            item.targets.includes(GlobalState.userID)
          ? styles.systemMessage
          : item.sender !== "0"
          ? styles.theirMessage
          : styles.hide,
      ]}
    >
      <Text
        style={
          item.id === "invisible"
            ? styles.invisibleText
            : item.sender === GlobalState.userID
            ? styles.yourMessageText
            : item.sender === "0" &&
              Array.isArray(item.targets) &&
              item.targets.includes(GlobalState.userID)
            ? styles.systemMessageText
            : styles.theirMessageText
        }
      >
        {item.text}
      </Text>
    </View>
  );

  //Grab messages from firebase & update the screen to show them
  useEffect(() => {
    if (!GlobalState.matchID || GlobalState.matchID.trim() === "") {
      console.error("Invalid match ID. Cannot fetch messages.");
      return;
    }
    let messagesRef = collection(db, "Chats", GlobalState.matchID, "Messages");

    const chatHistory = query(messagesRef, orderBy("timestamp"));
    const unsubscribe = onSnapshot(chatHistory, (querySnapshot) => {
      try {
        const messagesData = [];
        querySnapshot.forEach((doc) => {
          const target = doc.data();
          if (target.targets && !target.targets.includes(GlobalState.userID)) {
            return; // Skip messages not targeted at the user
          }
          messagesData.push({ id: doc.id, ...target });
        });

        messagesData.push({ id: "invisible" });
        console.log("Updating messages state");
        setMessages(messagesData);

        // Add slight delay to allow the UI to render before scrolling
        setTimeout(() => {
          // Scrolls up slightly when a new message comes in
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({
              offset: Math.max(0, messagesData.length * 50 - 100),
              animated: true,
            });
          }
        }, 100);
      } catch (error) {
        console.error("Error processing chat messages:", error);
      }
    });
    return () => unsubscribe();
  }, []);

  interface ChatData {
    user1MessageCount: number;
    user2MessageCount: number;
    promptSent: boolean;
    revealSent: boolean;
  }
  // Called when user sends a message to check if a prompt is needed
  const handleMessageCountAndPrompt = async (senderID) => {
    if (!GlobalState.matchID || GlobalState.matchID.trim() === "") {
      console.error("Invalid match ID. Cannot fetch messages.");
      return;
    }

    let chatRef = doc(db, "Chats", GlobalState.matchID);
    let messagesRef = collection(db, "Chats", GlobalState.matchID, "Messages");
    try {
      await runTransaction(db, async (transaction) => {
        if (!GlobalState.matchID || GlobalState.matchID === "") {
          console.error("GlobalState.matchID is invalid.");
          return;
        }

        chatRef =
          GlobalState.matchID && GlobalState.matchID.trim() !== ""
            ? doc(db, "Chats", GlobalState.matchID)
            : null;

        messagesRef =
          GlobalState.matchID && GlobalState.matchID.trim() !== ""
            ? collection(db, "Chats", GlobalState.matchID, "Messages")
            : null;

        if (!chatRef || !messagesRef) {
          console.error("Invalid match ID. Redirecting...");
          router.push("/unmatched");
          return;
        }

        const chatDocSnapshot = await transaction.get(chatRef);

        if (!chatDocSnapshot.exists()) {
          console.error("Chat document does not exist.");
          return;
        }

        const chatData = chatDocSnapshot.data();
        if (!chatData || typeof chatData !== "object") {
          console.error("Invalid chat data.");
          return;
        }

        const {
          user1_id,
          user2_id,
          user1MessageCount,
          user2MessageCount,
          promptSent,
          revealSent,
        } = chatData;

        // Update message counts
        let updatedCounts: Partial<ChatData> = {};
        if (senderID === user1_id) {
          updatedCounts.user1MessageCount = (user1MessageCount || 0) + 1;
        } else if (senderID === user2_id) {
          updatedCounts.user2MessageCount = (user2MessageCount || 0) + 1;
        }

        // Fetch the last message in the chat
        const lastMessageSnapshot = await getDocs(
          query(messagesRef, orderBy("timestamp", "desc"), limit(1))
        );

        let lastMessage = null;
        if (!lastMessageSnapshot.empty) {
          lastMessage = lastMessageSnapshot.docs[0].data();
        }

        if (!lastMessage) {
          console.warn("No previous message found in the chat.");
        }

        // If the last message was not a system message,
        if (lastMessage?.sender !== "0") {
          // Reset `promptSent`
          if (promptSent) {
            updatedCounts.promptSent = false;
          }
          // Reset `revealSent`
          if (revealSent) {
            updatedCounts.revealSent = false;
          }
        }

        // Check if a new prompt should be sent
        const newUser1Count =
          updatedCounts.user1MessageCount || user1MessageCount || 0;
        const newUser2Count =
          updatedCounts.user2MessageCount || user2MessageCount || 0;

        if (!revealSent && newUser1Count === 2 && newUser2Count === 2) {
          // Reveal the next group of attributes of their match
          revealsIndex = revealsIndex + 1; // revealsIndex++ was not working idk why
          if (revealsIndex >= reveals.length - 1) {
            revealsIndex = reveals.length - 1;
          }
          const revealPrompt =
            revealsIndex === 1
              ? `You unlocked parts of their profile!`
              : revealsIndex >= 2
              ? `You unlocked more of their profile!`
              : "";

          await RevealPartsOfProfile(
            GlobalState.matchID,
            reveals[revealsIndex]
          );

          await addDoc(messagesRef, {
            text: revealPrompt,
            sender: "0", // System message
            timestamp: new Date(),
            targets: [user1_id, user2_id],
          });

          // Mark reveal as sent
          updatedCounts.revealSent = true;
        }

        if (!promptSent && newUser1Count >= 4 && newUser2Count >= 4) {
          // Send system prompt
          let systemPrompt = `Ask ${chatSuggestions[chatSuggestionsIndex]}`;
          chatSuggestionsIndex =
            (chatSuggestionsIndex + 1) % chatSuggestions.length; // Cycle through

          await addDoc(messagesRef, {
            text: systemPrompt,
            sender: "0", // System message
            timestamp: new Date(),
            targets: [user1_id, user2_id],
          });

          // Reset message counts and mark prompt as sent
          updatedCounts.user1MessageCount = 0;
          updatedCounts.user2MessageCount = 0;
          updatedCounts.promptSent = true;
        }

        // Update Firestore with new counts and prompt status
        transaction.update(chatRef, updatedCounts);
      });
    } catch (error) {
      console.error("Error handling message count and prompt:", error);
    }
  };

  // Scrolls when the keyboard is opened
  useEffect(() => {
    // Listen for keyboard events
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    // Cleanup listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // This checks if the match is still valid but its lowkey not necessary because the messages useEffect can check as well
  // const useMatchValidityListener = () => {
  //   const [isMatchValid, setIsMatchValid] = useState(true); // has to start as true otherwise it will always fail

  //   console.log("GlobalState.matchID:", GlobalState.matchID);

  //   useEffect(() => {
  //     const initialize = async () => {
  //       if (
  //         !GlobalState.isUserSignedIn ||
  //         !GlobalState.userID ||
  //         GlobalState.userID === ""
  //       ) {
  //         console.error("Invalid state or user not signed in.");
  //         await LogoutUserAsync();
  //         router.push("/");
  //         return;
  //       }
  //       if (
  //         !GlobalState.matchID ||
  //         GlobalState.matchID.trim() === ""
  //       ) {
  //         console.error("Invalid match.");
  //         router.push("/unmatched");
  //         return;
  //       }

  //       // Firestore listener for match validation
  //       // const matchRef = doc(db, "Matches", GlobalState.matchID);
  //       const matchRef = GlobalState.matchID && GlobalState.matchID.trim() !== ""
  //           ? doc(db, "Matches", GlobalState.matchID)
  //           : null;

  //       if (!matchRef) {
  //         console.error("Invalid match ID. Redirecting...");
  //         router.push("/unmatched");
  //         return;
  //       }

  //       if (GlobalState.chatPageUnsubscribeMatch) {
  //         GlobalState.chatPageUnsubscribeMatch();
  //         GlobalState.chatPageUnsubscribeMatch = null;
  //         console.log("Chat Page: Previous match listener unsubscribed.");
  //       }

  //       GlobalState.chatPageUnsubscribeMatch = onSnapshot(
  //         matchRef,
  //         { includeMetadataChanges: true },
  //         async (matchSnapshot) => {
  //           if (!matchSnapshot.exists()) {
  //             console.warn("Match document does not exist. Redirecting...");
  //             setIsMatchValid(false);
  //             router.push("/unmatched");
  //             return;
  //           }

  //           if (matchSnapshot.metadata.fromCache) {
  //             console.log("Chat Page: Match data is from cache; waiting for server data...");
  //             return;
  //           }

  //           const matchData = matchSnapshot.data();
  //           console.log("Match data snapshot (Chat Page):", matchData);

  //           // Update validity based on `isDeleted`
  //           if (matchData.isDeleted) {
  //             console.warn("Chat Page: Match is deleted. Redirecting...");
  //             setIsMatchValid(false);
  //             router.push("/unmatched");
  //           } else if (matchData.user1_id != GlobalState.userID && matchData.user2_id != GlobalState.userID) {
  //             console.warn("Chat Page: User isn't in match. Redirecting...");
  //             setIsMatchValid(false);
  //             router.push("/unmatched");
  //           }
  //           else {
  //             setIsMatchValid(true);
  //           }
  //         },
  //         (error) => {
  //           console.error("Error listening to match updates:", error);
  //         }
  //       );
  //     };

  //     initialize();

  //     // Cleanup listener on component unmount
  //     return () => {
  //       if (GlobalState.chatPageUnsubscribeMatch) {
  //         GlobalState.chatPageUnsubscribeMatch();
  //         GlobalState.chatPageUnsubscribeMatch = null;
  //         console.log("Chat Page: Match listener unsubscribed.");
  //       }
  //     };
  //   }, []);

  //   return isMatchValid;
  // };

  // const isMatchValid = useMatchValidityListener();

  // useEffect(() => {
  //   if (pathname !== "/Chat") return;

  //   if (!isMatchValid) {
  //     console.warn("Invalid match detected on chat page. Redirecting...");
  //     router.push("/unmatched");
  //   }
  // }, [isMatchValid]);

  const isMatchProfilePicRevealed = useIsMatchProfilePicRevealed();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push("/LandingPage")}>
          <View
            style={[
              profileStyles.iconImage,
              !isMatchProfilePicRevealed && profileStyles.blurredPhoto,
            ]}
          >
            {isMatchProfilePicRevealed && GlobalState.matchProfilePic ? (
              <Image
                source={{ uri: GlobalState.matchProfilePic }}
                style={profileStyles.iconImage}
              />
            ) : (
              <Image
                source={require("../assets/images/BlankProfilePic.png")}
                style={profileStyles.iconImage}
              />
            )}
            {!isMatchProfilePicRevealed && (
              <View style={StyleSheet.absoluteFill}>
                <BlurView
                  style={[
                    StyleSheet.absoluteFill,
                    profileStyles.iconblurBox,
                    profileStyles.iconblur,
                    profileStyles.iconImage,
                  ]}
                  intensity={5}
                  tint="light"
                >
                  <Ionicons name="help" size={24} color="black" />
                </BlurView>
              </View>
            )}
          </View>
        </Pressable>
      ),
    });
  }, [navigation, isMatchProfilePicRevealed]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[styles.messagesContainer]}
          onContentSizeChange={() => {
            if (messages.length > 0 && flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }}
        />

        {/* Input container */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={inputText}
            onFocus={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            submitBehavior={"submit"}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 100,
    shadowRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5, // Added for Android compatibility
  },
  container: {
    flex: 1,
    backgroundColor: Colors.pink,
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 0,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 15,
    maxWidth: "80%",
  },
  yourMessage: {
    backgroundColor: Colors.darkPurple,
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: Colors.grayCell,
    alignSelf: "flex-start",
  },
  yourMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#1E1E1E",
  },
  invisibleBubble: {
    opacity: 0,
    padding: 0,
    margin: 0,
    height: 5,
  },
  invisibleText: {
    opacity: 0,
    padding: 0,
    margin: 0,
  },
  inputContainer: {
    height: 60,
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 0,
    borderColor: "#000",
    marginBottom: 25,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: Colors.grayCell,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: Colors.darkPurple,
    borderRadius: 30,
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  systemMessage: {
    backgroundColor: Colors.pink,
    alignSelf: "center",
  },
  systemMessageText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  hide: {
    height: 0,
    width: 0,
  },
});

export default ChatScreen;
