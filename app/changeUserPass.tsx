import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function changeUserPass() {
  const [email, setEmail] = useState("text@example.com");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Email</Text>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        placeholder={email}
        placeholderTextColor={"rgba(0, 0, 0, 0.5)"}
      />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Change password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pink,
    alignItems: "center",
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontFamily: "Kurale_400Regular",
    marginBottom: 10,
    alignSelf: "flex-start",
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
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Kurale_400Regular",
  },
});
