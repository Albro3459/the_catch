import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from "react-native";

export enum MediaType {
  profilePic = "profilePic",
  photo = "photos",
  video = "video",
}


export const uploadMedia = async (userID: string, uri: string, mediaType: MediaType, index?: number): Promise<string> => {
    try {
        const storage = getStorage();

        const fileExtension = uri.split(".").pop()?.toLowerCase() || "unknown";
        const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(fileExtension);

        const folder = mediaType
        const fileName = mediaType === MediaType.photo ? `photo${index ?? 0}.${fileExtension}` : `${mediaType}.${fileExtension}`;

        const fileRef = ref(storage, `users/${userID}/${folder}/${fileName}`);

        // Check if the file already exists and delete it
        try {
            await getDownloadURL(fileRef); // Try to get the file's download URL
            await deleteObject(fileRef); // If successful, delete the existing file
            console.log(`Deleted existing media file: ${fileName}`);
        } catch (error) {
            // If the file does not exist, ignore the error
            if (error.code !== 'storage/object-not-found') {
                console.error("Error checking existing file:", error);
                throw error;
            }
        }

        // Resize and compress the image
        const compressedImage = mediaType !== MediaType.video ? await manipulateAsync(
          uri, // Source image URI
          [{ resize: { width: mediaType === MediaType.profilePic ? 350 : 500 } }], // Specify only width to maintain aspect ratio
          {
            compress: 1, // Compression quality
            format: SaveFormat.JPEG, // Save as JPEG
          }
        ) : {uri: uri};

        const response = await fetch(compressedImage.uri);
        const blob = await response.blob();

        // Upload the new file
        await uploadBytes(fileRef, blob);

        const downloadURL = await getDownloadURL(fileRef);
        console.log(`Uploaded media URL: ${downloadURL}`);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading media:", error);
        Alert.alert("Error", "Unable to upload media. Please try again.");
        return "";
    }
};


export const selectMedia = async (mediaType: MediaType): Promise<string> => {
    try {
      // Request permission to access the media library
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (!mediaLibraryPermission.granted || !cameraPermission.granted) {
        Alert.alert("Permission Required", "Photo and camera access is required.");
        return "";
      }

      // Prompt user to select a source
      const action = await new Promise<string>((resolve) => {
        Alert.alert(
          "Choose Media Source",
          "Select an option to upload your media",
          [
            { text: "Cancel", onPress: () => resolve("cancel"), style: "cancel" },
            { text: `Take ${mediaType === MediaType.video ? "Video" : "Photo"}`, onPress: () => resolve("camera") },
            { text: "Camera Roll", onPress: () => resolve("library") },
          ]
        );
      });

      if (action === "cancel") {
        return "";
      }

      let pickerResult;
      if (action === "camera") {
        // Launch the camera
        pickerResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images', 'videos'],
          allowsEditing: mediaType === MediaType.profilePic, // Set to true if you want to enable cropping
          aspect: [16, 11],
          quality: 1.0,
        });
      } else if (action === "library") {
        // Launch the library
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images', 'videos'], 
          allowsEditing: mediaType === MediaType.profilePic, // Set to true if you want to enable cropping
          aspect: [16, 11], 
          quality: 1.0, 
        });
      }  

      if (pickerResult?.canceled) {
        return "";
      }
  
      // Extract the photo URI and validate its type
      const mediaUri = pickerResult.assets?.[0]?.uri || "";
      const fileType = mediaUri.split(".").pop()?.toLowerCase();
  
      const supportedTypes = ['jpg', 'jpeg', 'png', 'tiff', 'mp4', 'mov', 'avi', 'mkv'];

      if (!supportedTypes.includes(fileType || '')) {
        Alert.alert('Error', 'Unsupported media type. Please select a supported file.');
        return '';
      }
  
      return mediaUri;
    } catch (error) {
      console.error("ImagePicker Error:", error);
      Alert.alert("Error", "Could not select photo. Please try again.");
      return "";
    }
};

export default {};
