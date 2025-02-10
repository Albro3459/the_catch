import { StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

export const profileStyles = StyleSheet.create({
    background: {
        backgroundColor: Colors.pink,
        padding: "5%",
    },
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
        elevation: 5,  // Added for Android compatibility
    },
    matchProfileImage: {
        width: 225,
        height: 225,
        borderRadius: 112.5, // must be exactly half the width and height for a circle
        resizeMode: "contain",
    },
    blankProfileImage: {
        width: 150,
        height: 150,
        borderRadius: 75, // must be exactly half the width and height for a circle
        resizeMode: "contain",
    },
    iconImage: {
        width: 40,
        height: 40,
        borderRadius: 20, // must be exactly half the width and height for a circle
        resizeMode: "contain",
        marginBottom: 2,
    },
    loading: { 
        marginTop: 110, 
        paddingLeft: "10%", 
        justifyContent: "center", 
        alignSelf: "center", 
    },
    topContainer: {
        justifyContent: "space-around",
        alignItems: "center",
        marginVertical: "5%",
        marginTop: -40,
    },
    profilePicContainer: {
        width: 150,
        height: 150,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginVertical: "5%",
        shadowRadius: 10,
        shadowColor: "black",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 5 },
        elevation: 10, // Ensure shadow visibility on Android
        borderRadius: 75, // must be exactly half the width and height for a circle
    },
    matchTopContainer: {
        width: 225,
        height: 225,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        shadowRadius: 10,
        shadowColor: "black",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 5 },
        elevation: 10, // Ensure shadow visibility on Android
        borderRadius: 112.5, // must be exactly half the width and height for a circle
    },
    container: {
        backgroundColor: "white",
        paddingVertical: "4%",
        borderRadius: 15,
        marginVertical: "5%",
    },
    labelContainer: {
        flexDirection: "row",
        paddingRight: "5%",
    },
    pressableContainer: {
        flexWrap: "wrap",
        flexDirection: "row",
        alignItems: "flex-start",
        rowGap: 5,
        columnGap: 5,
        paddingLeft: 20,
        paddingRight: 16,
        marginBottom: 20,
    },
    photosContainer: {
        flexWrap: "wrap",
        flexDirection: "row",
        alignItems: "flex-start",
        rowGap: 5,
        columnGap: 5,
        paddingHorizontal: 20,
        minHeight: 150
    },
    svgContainer: {
        width: "32%",
        aspectRatio: 11 / 16,
        borderColor: "black",
        borderWidth: .5,
        borderRadius: 10,
    },
    photo: {
        width: "100%",
        height: "100%",
        // aspectRatio: 16 / 11, // Maintains 16:11 aspect ratio
        borderRadius: 10,
    },
    video: {
        width: "100%",
        height: "100%",
        // aspectRatio: 16 / 11, // Maintains 16:11 aspect ratio
        borderRadius: 10,
        // backgroundColor: "#000",
    },
    photoShadow: {
        width: "32%",
        aspectRatio: 11 / 16,
        borderRadius: 15,

        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // for Android
    },
    textField: {
        backgroundColor: Colors.grayCell,
        width: "90%",
        height: 50,
        borderRadius: 15,
        marginBottom: 20,
        fontSize: 18,
        color: Colors.grayText,
        padding: 10,
        textAlign: "left",
        alignSelf: "center",
    },
    textBox: {
        backgroundColor: Colors.grayCell,
        width: "87.5%",
        minHeight: 200,
        borderRadius: 15,
        marginBottom: 20,
        fontSize: 18,
        color: Colors.grayText,
        padding: 15,
        textAlignVertical: "top",
        alignSelf: "center",
    },
    selectedTextBox: {
        color: "white",
        backgroundColor: Colors.darkPurple,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // for Android
    },
    bigText: {
        fontSize: 32, 
        fontFamily: "Kurale_400Regular", 
        alignSelf:"center",
        paddingBottom: 10,
        marginTop: -10,
    },
    nameText: {
        fontSize: 35,
        fontFamily: "Kurale_400Regular",
        padding: "2%",
    },
    labelText: {
        color: "black",
        fontSize: 23,
        fontFamily: "Kurale_400Regular",
        paddingBottom: 5,
        paddingLeft: "8%",
    },
    headerButtons: {
        marginLeft: 10,
        marginRight: 5
    },
    eyeContainer: {
        justifyContent: "center",
        alignItems: "flex-end",
    },
    separatorLine: {
        width: "90%",
        height: 1,
        backgroundColor: "black",
        marginVertical: 10,
        alignSelf: "center",
    },
    pressableBubble: {
        borderRadius: 30,
        backgroundColor: Colors.grayCell,
        padding: "4%",
    },
    pressableText: {
        fontSize: 16,
        color: Colors.grayText,
    },
    selectedBubble: {
        backgroundColor: Colors.darkPurple,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // for Android
    },
    selectedBubbleText: {
        color: "white"
    },
    buttonContainer: {
        flex: 1,
        flexDirection: "row",
        paddingHorizontal: "5%",
        justifyContent: "center",
        columnGap: 15,
    },
    saveButton: {
        backgroundColor: Colors.magenta,
        width: "45%",
        alignItems: "center",
        marginTop: "4%",
        borderRadius: 15,
    },
    cancelButton: {
        backgroundColor: Colors.darkPurple,
        width: "45%",
        alignItems: "center",
        marginTop: "4%",
        borderRadius: 15,
    },
    buttonText: {
        color: "white",
        fontSize: 36,
        fontFamily: "Kurale_400Regular",
    },
    blur: {
        overflow: "hidden",
        alignSelf: "stretch",
        borderRadius: 30,
        minWidth: "50%",
        paddingHorizontal: "4%",
    },
    blurText: {
        fontSize: 12,
        color: "black",
        fontFamily: "Kurale_400Regular",
        textAlign: "center"
    },
    blurBox: {
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        overflow: 'hidden',
        borderRadius: 10
    },
    blurredPhoto: {
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    pressableBlurBackground: { 
        backgroundColor: 'rgba(50, 50, 50, 0.2)', 
        borderRadius: 30 
    },
    imageBlurBackground: { 
        backgroundColor: 'rgba(200, 200, 200, 0.7)', 
        borderRadius: 10 
    },
    iconblur: {
        overflow: "hidden",
        alignSelf: "stretch",
        borderRadius: 20,
        minWidth: "50%",
        paddingHorizontal: "4%",
      },
    iconblurBox: {
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        overflow: 'hidden',
        borderRadius: 20
    },
    dateContainer: {
        backgroundColor: Colors.grayCell,
        width: "90%",
        height: 50,
        borderRadius: 15,
        marginBottom: 20,
        padding: 10,
        alignContent: "flex-start",
        alignSelf: "center",
        justifyContent: "center",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // for Android
    },
    selectedDateContainer: {
        backgroundColor: Colors.darkPurple,
    },
    datePicker: {
        borderRadius: 15,
        alignSelf: "flex-start",
        overflow: "hidden",
    },
});