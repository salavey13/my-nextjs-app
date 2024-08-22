// components/ThemeHandler.tsx

"use client";

import { useEffect } from "react";

const ThemeHandler = () => {
//   useEffect(() => {
//     const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

//     if (prefersDarkScheme) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }

//     const themeChangeListener = (e: MediaQueryListEvent) => {
//       if (e.matches) {
//         document.documentElement.classList.add("dark");
//       } else {
//         document.documentElement.classList.remove("dark");
//       }
//     };

//     window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeChangeListener);

//     return () => {
//       window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", themeChangeListener);
//     };
//   }, []);

  return null;
};

export default ThemeHandler;
