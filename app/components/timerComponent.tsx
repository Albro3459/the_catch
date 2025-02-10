import { StyleSheet, View, Text } from "react-native";
import { profileStyles } from "@/styles/profileStyles";
import { Colors } from "@/constants/Colors";
import { GlobalState } from "@/GlobalState";


// React has a stupid bug where it doesnt fully count down to 0 when executing an async function.
    // We execute await getMatch() in /unmatched startSimulation() and this causes the times to not fully count down visually
const checkTimerEnd = (times: number[]) => {
    if (GlobalState.isSimulatingTimer) {
        if (times[0] <= 0 && times[1] == 0) {
            return true;
        }
        else if (times[0] <= 0 && times[1] <= 1 && times[2] <= 30 && times[3] != null) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return times[0] <= 0 && times[1] <= 0  && times[2] <= 0 && times[3] <= 0;
    }
};

interface TimerProps {
    times: number[];
};

export const Timer = ({ times }: TimerProps) => {

    const labels = times[0] > 0 ? ["days", "hours", "min"] : ["hours", "min", "sec"];
    // if days > 0, skip sec, else, skip days
    const adjustedTimes = times[0] > 0 ? times.slice(0, 3) : times.slice(1);

    const isTimerEnded = checkTimerEnd(times);

    return (
        <View style={styles.timerContainer}>
            {labels.map((label, index) => (
                <View key={index} style={styles.blockContainer}>
                    <Text style={styles.time}>
                        {isTimerEnded ? 0 : Math.max(0, adjustedTimes[index])}
                    </Text>
                    <Text style={styles.label}>{label}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    timerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      },
    blockContainer: {
      backgroundColor: Colors.darkPurple,
      borderRadius: 10,
      paddingVertical: 20,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 90,
      marginHorizontal: 7.5,
    },
    time: {
      fontSize: 48,
      fontWeight: "bold",
      color: "white",
    },
    label: {
      fontSize: 14,
      color: "#f0f0f0",
      marginTop: 5,
    },
  });

  export default {};