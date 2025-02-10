import { router } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, Switch, Pressable, Linking } from "react-native";
import { Link, Href } from "expo-router";
 import { useNavigation } from '@react-navigation/native';
import { Colors } from "@/constants/Colors";
import { GlobalState, LogoutUserAsync } from "@/GlobalState";

export default function Settings() {
  const [appearInPool, setAppearInPool] = useState(false);

    const toggleSwitch = () => setAppearInPool((previousState) => !previousState);

    const logout = async () => {
      try {
        await LogoutUserAsync();
        router.push("/");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };


  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <Pressable
          style={styles.menuItem}
          onPress={() => {
            router.push("/changeUserPass");
          }}
        >
          <Text style={styles.menuItemText}>Change Password</Text>
        </Pressable>
        <Pressable
          style={styles.menuItem}
          onPress={() => {
            router.push("/matchPreferences");
          }}
        >
          <Text style={styles.menuItemText}>Match Preferences</Text>
        </Pressable>
        <View style={styles.switchItem}>
          <Text style={styles.menuItemText}>Appear in Pool</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={appearInPool ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={appearInPool}
          />
        </View>
        <Pressable style={styles.menuItem} onPress={() => {}}>
          <Text style={styles.menuItemText}>Notifications</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => {}}>
          <Text style={styles.menuItemText}>Help and Support</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={logout}>
            <Text style={styles.menuItemText}>Logout</Text>
        </Pressable>
        <Pressable
          style={[styles.menuItem, { borderBottomWidth: 0 }]}
          onPress={() => {
            router.push("/deleteAccount");
          }}
        >
          <Text style={styles.menuItemText}>Delete Account</Text>
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
    fontFamily: "Kurale_400Regular"
  },
});
