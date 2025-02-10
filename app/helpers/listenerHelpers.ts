import { db } from "@/firebaseConfig";
import { GlobalState } from "@/GlobalState";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

function useIsMatchProfilePicRevealed() {
    const [isMatchProfilePicRevealed, setIsMatchProfilePicRevealed] = useState(false);
  
    useEffect(() => {
      const initializeListener = async () => {
        const matchID = GlobalState.matchID;
        const matchedUserID = GlobalState.userID;
  
        if (!matchedUserID || !matchID) return;
  
        const matchesTableRef = doc(db, 'Matches', matchID);
  
        // Load cached data initially
        const matchTableSnapshot = await getDoc(matchesTableRef);
        if (matchTableSnapshot.exists()) {
          const matchData = matchTableSnapshot.data();
          const groups = matchData?.revealGroups || [];
          const isRevealed = groups.includes('A');
          GlobalState.isMatchProfilePicRevealed = isRevealed;
          setIsMatchProfilePicRevealed(isRevealed);
          console.log(`Initial Reveal Groups: ${groups}`);
        } else {
          console.error('Match document not found.');
          return;
        }
  
        // Set up Firestore listener for live updates
        GlobalState.landingPageUnsubscribeMatch = onSnapshot(
          matchesTableRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const matchData = snapshot.data();
              const groups = matchData?.revealGroups || [];
              const isRevealed = groups.includes('A');
              GlobalState.isMatchProfilePicRevealed = isRevealed;
              setIsMatchProfilePicRevealed(isRevealed);
              console.log(`Updated Reveal Groups: ${groups}`);
            } else {
              console.warn('Match document not found.');
            }
          },
          (error) => {
            console.error('Error listening to Matches table updates:', error);
          }
        );
      };
  
      initializeListener();
  
      // Cleanup on unmount
      return () => {
        if (GlobalState.landingPageUnsubscribeMatch) {
          GlobalState.landingPageUnsubscribeMatch();
          console.log('Match listener unsubscribed.');
        }
      };
    }, []);
  
    return isMatchProfilePicRevealed;
  }  

export default useIsMatchProfilePicRevealed;