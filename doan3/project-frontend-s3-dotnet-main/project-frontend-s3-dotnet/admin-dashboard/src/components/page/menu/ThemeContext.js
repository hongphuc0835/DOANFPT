// ThemeContext.js
import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const savedTheme = localStorage.getItem("theme");
  const savedSidebarState = localStorage.getItem("collapsed") === "true";

  const [isDarkMode, setIsDarkMode] = useState(savedTheme ? savedTheme === "dark" : true);
  const [collapsed, setCollapsed] = useState(savedSidebarState);

  useEffect(() => {
    // Store theme and sidebar state in localStorage when they change
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    localStorage.setItem("collapsed", collapsed.toString());
  }, [isDarkMode, collapsed]);
  // Function to toggle sidebar collapse state
  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, collapsed, setCollapsed, toggleSidebar }}>{children}</ThemeContext.Provider>;
};
