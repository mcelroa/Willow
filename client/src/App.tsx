import { useEffect, useState } from "react";
import agent from "./lib/api/agent";

export default function App() {
   const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

   useEffect(() => {
      agent.CheckIns.list().then(setCheckIns);
   }, []);

   return (
      <ul>
         {checkIns.map((checkIn) => (
            <li key={checkIn.id}>{checkIn.id}</li>
         ))}
      </ul>
   );
}
