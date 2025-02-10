import React, { Dispatch, SetStateAction } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { profileStyles } from "../../styles/profileStyles";

interface EyeToggleProps {
    icon: React.ComponentProps<typeof Feather>['name'];
    onPress: () => void;
    styles: typeof profileStyles;
}

export const EyeToggle: React.FC<EyeToggleProps> = ({ icon, onPress, styles }) => (
    <View style={styles.eyeContainer}>
        <Pressable onPress={onPress} style={styles.headerButtons }>
            <Feather name={icon} size={28} color="black"/>
        </Pressable>
    </View>
);


const singleToggleSelection = (attribute: string, defaultAttribute: string, setState: Dispatch<SetStateAction<string>>, startEditing?: () => void) => {
    if (startEditing) {
        startEditing();
    }
    // if the same bubble is selected, then it was unselected so choose the default, otherwise the attribute was selected
    setState((prevSelected: any) => (prevSelected === attribute ? defaultAttribute : attribute));
};

interface SinglePressableBubbleGroupProps {
    labels: string[];
    selectedLabel: string;
    defaultAttribute: string;
    setLabelState: Dispatch<SetStateAction<string>>;
    styles: typeof profileStyles;
    startEditing: () => void;
}

export const SinglePressableBubbleGroup: React.FC<SinglePressableBubbleGroupProps> = ({ labels, selectedLabel, defaultAttribute, setLabelState, styles, startEditing }) => (
    labels.map((label) =>
        <Pressable key={label} onPress={() => singleToggleSelection(label, defaultAttribute, setLabelState, startEditing)} style={[styles.pressableBubble, selectedLabel === label && styles.selectedBubble]}>
            <Text style={[styles.pressableText, selectedLabel === label && styles.selectedBubbleText]}>{label}</Text>
        </Pressable>
    )
);

// function to toggle selecting an attribute or bubble
const multiToggleSelection = (attribute: any, setState: Dispatch<SetStateAction<any>>, startEditing?: () => void) => {
    if (startEditing) {
        startEditing();
    }
    setState((prevSelected: any) => {
        const updatedSelected = new Set(prevSelected);
        if (updatedSelected.has(attribute)) {
            updatedSelected.delete(attribute); // Unselect
        } else {
            updatedSelected.add(attribute); // Select
        }
        return updatedSelected;
    });
};

interface MultiPressableBubblesGroupProps {
    labels: string[];
    selectedLabels: Set<string>;
    setLabelState: Dispatch<SetStateAction<Set<string>>>;
    styles: typeof profileStyles;
    startEditing: () => void;
}

export const MultiPressableBubblesGroup: React.FC<MultiPressableBubblesGroupProps> = ({ labels, selectedLabels, setLabelState, styles, startEditing }) => (
    labels.map((label) =>
        <Pressable key={label} onPress={() => multiToggleSelection(label, setLabelState, startEditing)} style={[styles.pressableBubble, selectedLabels.has(label) && styles.selectedBubble]}>
            <Text style={[styles.pressableText, selectedLabels.has(label) && styles.selectedBubbleText]}>{label}</Text>
        </Pressable>
    )
);



interface EditingAlertProps {
    condition?: any;
    onConfirm: () => void;
    elseFunc?: () => void;
    messageHeader?: string;
    messageBody?: string;
}

export const LeavingEditScreenAlert = ({ condition, onConfirm, elseFunc, messageHeader, messageBody }: EditingAlertProps) => {
    const shouldShowAlert = condition ?? true;
    if (shouldShowAlert) {
        Alert.alert(
            `${messageHeader ? messageHeader : "Unsaved Changes"}`,
            `${messageBody ? messageBody : "You have unsaved changes. Are you sure you want to continue?"}`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: () => { onConfirm(); },
                },
            ]
        );
    } else {
        if (elseFunc) {
            elseFunc();
        }
    }
};

export default { EyeToggle, SinglePressableBubbleGroup, MultiPressableBubblesGroup, LeavingEditScreenAlert };