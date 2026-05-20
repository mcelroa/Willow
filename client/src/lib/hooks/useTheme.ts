import { useEffect, useState } from "react";

export const useTheme = () => {
   const [isDark, setIsDark] = useState(
      () => localStorage.getItem("theme") === "dark",
   );

   useEffect(() => {
      document.documentElement.classList.toggle("dark", isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
   }, [isDark]);

   const toggleTheme = () => setIsDark((prev) => !prev);

   return { isDark, toggleTheme };
};
