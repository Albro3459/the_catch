import React, { useEffect, useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { GlobalState } from "@/GlobalState";

export default function VisualizeFirestoreData() {
    const [userData, setUserData] = useState(null); // State to store user data

    const fetchUserData = async (userId: string) => {
        try {
            const userRef = doc(db, "Users", userId); // Replace "Users" with your collection name
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                const data = userSnapshot.data();
                setUserData(data); // Store data in state
                console.log("User Data:", data); // Log to console
            } else {
                Alert.alert("Error", "User not found in Firestore.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            Alert.alert("Error", "Failed to fetch user data.");
        }
    };

    useEffect(() => {
        const userId = "blsWv6EVMSJfGW2STv8G"; // Replace with your actual user ID
        fetchUserData(userId);
    }, []);

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>User Data:</Text>
            {userData ? (
                <Text style={{ fontSize: 14, marginTop: 10 }}>
                    {JSON.stringify(userData, null, 2)} {/* Pretty-print JSON */}
                </Text>
            ) : (
                <Text>Loading...</Text>
            )}
        </ScrollView>
    );
}
