import { useEffect, useRef, useState } from "react";
import { Joyride, STATUS, type EventData, type Step } from "react-joyride";
import { useAccount } from "@/lib/hooks/useAccount";

type Props = {
   pageName: string;
   steps: Step[];
};

export default function TourGuide({ pageName, steps }: Props) {
   const { currentUser, markPageToured } = useAccount();
   const [run, setRun] = useState(false);
   const hasStarted = useRef(false);
   const hasMarked = useRef(false);

   useEffect(() => {
      if (hasStarted.current || !currentUser) return;
      if (!currentUser.touredPages.includes(pageName)) {
         hasStarted.current = true;
         setRun(true);
      }
   }, [currentUser, pageName]);

   const handleEvent = ({ status }: EventData) => {
      if (hasMarked.current) return;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
         hasMarked.current = true;
         setRun(false);
         markPageToured.mutate(pageName);
      }
   };

   return (
      <Joyride
         steps={steps}
         run={run}
         continuous
         scrollToFirstStep
         onEvent={handleEvent}
         locale={{
            back: "Back",
            close: "Close",
            last: "Done",
            next: "Next",
            skip: "Skip tour",
         }}
         options={{
            buttons: ["back", "primary", "skip"],
            primaryColor: "hsl(221, 83%, 53%)",
            zIndex: 10000,
         }}
         styles={{
            buttonPrimary: { borderRadius: "6px", fontSize: "14px" },
            buttonBack: { borderRadius: "6px", fontSize: "14px" },
            buttonSkip: { fontSize: "13px" },
            tooltip: { borderRadius: "8px", fontSize: "14px" },
         }}
      />
   );
}
