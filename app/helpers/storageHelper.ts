import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const Storage = {
    async getItem(key: string) {
        if (Platform.OS === "web") {
            return Promise.resolve(localStorage.getItem(key));
        } else {
            return AsyncStorage.getItem(key);
        }
    },
    async setItem(key: string, value: string) {
        if (Platform.OS === "web") {
            localStorage.setItem(key, value);
            return Promise.resolve();
        } else {
            return AsyncStorage.setItem(key, value);
        }
    },
    async removeItem(key: string) {
        if (Platform.OS === "web") {
            localStorage.removeItem(key);
            return Promise.resolve();
        } else {
            return AsyncStorage.removeItem(key);
        }
    }
};

export default {};