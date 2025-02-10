import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Button,
  Pressable,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";

import React, { useState, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import { GlobalState } from "@/GlobalState";

const screenWidth = Dimensions.get("window").width;

export default function report() {
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const [pressedIds, setPressedIds] = useState([]);
  const names = [
    "Scam",
    "Abusive",
    "Violent",
    "Racist",
    "Sexist",
    "Homophobic",
    "Other",
  ];

  const handleOutsideTouch = () => {
    setIsTextInputVisible(false);
    Keyboard.dismiss();
  };

  const handlePress = (id) => {
    if (pressedIds.includes(id)) {
      setPressedIds(pressedIds.filter((item) => item !== id));
    } else {
      setPressedIds([...pressedIds, id]);
    }
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={[styles.background, { flex: 1 }]}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 10 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={handleOutsideTouch}>
          {/* <View style={[styles.background, { flex: 1 }]}> */}
          <View style={styles.container}>
            <Text style={styles.bigText}>Reporting {GlobalState.matchName.length > 0 ? GlobalState.matchName : "User"}:</Text>
            <Text style={styles.smallText}>Select All:</Text>
            <View style={styles.attributeView}>
              {Array.from({ length: 7 }).map((_, index) => (
                <Pressable
                  key={`attribute-${index}`}
                  style={[
                    styles.attribute,
                    pressedIds.includes(index) && styles.attributePressed,
                  ]}
                  onPress={() => handlePress(index)}
                >
                  <Text
                    style={[
                      styles.attributeText,
                      pressedIds.includes(index) && styles.attributeTextpressed,
                    ]}
                  >
                    {names[index]}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.smallText}>Description:</Text>
            <TextInput
              style={styles.textInput}
              textAlignVertical="top"
              textAlign="left"
              multiline={true}
            ></TextInput>
            <Pressable style={styles.reportButton}>
              <Text style={styles.reportButtonText}>Report</Text>
            </Pressable>
          </View>
          {/* </View> */}
        </TouchableWithoutFeedback>
        <View style={{ padding: "24%" }}></View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    borderRadius: screenWidth / 30,
    justifyContent: "space-around",
    marginVertical: "5%",
  },
  smallText: {
    fontSize: 18,
    paddingLeft: "2%",
    flexWrap: "wrap",
    paddingVertical: "2%",
    fontFamily: "Kurale_400Regular",
  },
  bigText: {
    fontSize: 24,
    padding: "5%",
    alignSelf: "center",
    fontFamily: "Kurale_400Regular",
  },
  textInput: {
    backgroundColor: Colors.grayCell,
    height: "40%",
    width: "90%",
    borderRadius: 10,
    padding: "5%",
    alignSelf: "center",
    flex: 11,
    paddingBottom: "20%",
  },
  attributeName: {
    fontSize: 24,
    padding: "1%",
    alignSelf: "flex-start",
  },
  attribute: {
    borderRadius: 30,
    backgroundColor: Colors.grayCell,
    paddingHorizontal: "4%",
    paddingVertical: "4%",
  },
  attributePressed: {
    borderRadius: 30,
    backgroundColor: Colors.darkPurple,
    paddingHorizontal: "4%",
    paddingVertical: "4%",
  },
  attributeView: {
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "flex-start",
    rowGap: 5,
    columnGap: 5,
    paddingHorizontal: "3%",
  },
  attributeText: {
    fontSize: 16,
    color: Colors.grayText,
  },
  attributeTextpressed: {
    fontSize: 16,
    color: "#ffffff",
  },
  reportButton: {
    backgroundColor: Colors.magenta,
    paddingHorizontal: "5%",
    paddingVertical: "2%",
    margin: "6%",
    borderRadius: 20,
    alignSelf: "center",
  },
  reportButtonText: {
    color: "white",
    fontSize: 32,
    fontFamily: "Kurale_400Regular",
  },
});
