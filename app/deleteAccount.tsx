import { Colors } from "@/constants/Colors";
import { db } from "@/firebaseConfig";
import { GlobalState, LogoutUserAsync } from "@/GlobalState";
import { router } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";

export default function deleteAccount() {
  const [email, setEmail] = useState("Email");
  const [pass, setPass] = useState("Password");

  const resetUserForRegistration = async () => {
    const userID = GlobalState.userID; // Get the user ID from GlobalState
  
    if (!userID) {
      console.warn("No userID found in GlobalState.");
      return;
    }
  
    try {
      const userRef = doc(db, "Users", userID);
  
      // Update Firestore document fields to reset for registration
      await updateDoc(userRef, {
        isRegistered: false,
        profilePic: "",
      });
  
      console.log("User profile reset for registration.");
  
      await LogoutUserAsync();
      router.push("/");
    } catch (error) {
      console.error("Error resetting user profile:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Confirm account deletion:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(t) => {
            t.length == 0 ? setEmail("Email") : setEmail(t);
          }}
          placeholder={email}
          placeholderTextColor={"rgba(0, 0, 0, 0.5)"}
        />
        <TextInput
          secureTextEntry={true}
          style={styles.input}
          onChangeText={(t) => {
            t.length == 0 ? setPass("Password") : setPass(t);
          }}
          placeholder={pass}
          placeholderTextColor={"rgba(0, 0, 0, 0.5)"}
        />
        <Pressable style={styles.button} onPress={async () => (await resetUserForRegistration())}>
          <Text style={styles.buttonText}>Delete account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pink,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  menuContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    width: "85%",
    marginTop: 15,
    alignContent: "center",
  },
  menuItem: {
    fontSize: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  switchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuItemText: {
    fontSize: 18,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: Colors.magenta,
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Kurale_400Regular",
  },
  menuTitle: {
    marginBottom: 15,
    fontSize: 18,
    fontFamily: "Kurale_400Regular",
  },
});
