'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';

const words = ["new", "quiet", "comfy", "popular", "scenic"];

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const enabled = saved === "true";
    if (enabled) {
      setDarkMode(true);
    }
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout;

    if (typing) {
      // Type one character at a time
      if (displayed.length < words[index].length) {
        timeout = setTimeout(() => {
          setDisplayed(words[index].slice(0, displayed.length + 1));
        }, 100);
      } else {
        // Pause before deleting
        timeout = setTimeout(() => setTyping(false), 1500);
      }
    } else {
      // Delete one character at a time
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, 50);
      } else {
        // Go to next word
        setIndex((prev) => (prev + 1) % words.length);
        setTyping(true);
      }
    } 
    
    return () => clearTimeout(timeout);
  }, [displayed, typing, index]);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-neutral-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 overflow-hidden">
      
      {/* Background SVG */}
      <div className="absolute -top-[30vh] -left-[50vh] opacity-40 z-0 pointer-events-none select-none">
        <svg width="100%" height="150vh" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
          <path
            fill={darkMode ? "black" : "#dddddd"}
            fillRule="evenodd"
            d="M11.291 21.706 12 21l-.709.706zM12 21l.708.706a1 1 0 0 1-1.417 0l-.006-.007-.017-.017-.062-.063a47.708 47.708 0 0 1-1.04-1.106 49.562 49.562 0 0 1-2.456-2.908c-.892-1.15-1.804-2.45-2.497-3.734C4.535 12.612 4 11.248 4 10c0-4.539 3.592-8 8-8 4.408 0 8 3.461 8 8 0 1.248-.535 2.612-1.213 3.87-.693 1.286-1.604 2.585-2.497 3.735a49.583 49.583 0 0 1-3.496 4.014l-.062.063-.017.017-.006.006L12 21zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="z-10 text-center animate-fadeIn">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
          Study at <span className="text-[#98002E]">BC</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-lg mx-auto">
          Discover <span className="typewriter">{displayed}</span> places to study at Boston College.
        </p>
        <Link
          href="/map"
          className="inline-block px-8 py-3 bg-[#98002E] text-white font-medium rounded-xl hover:bg-[#750023] transition-colors duration-300 shadow-md"
        >
          Go to Map
        </Link>
      </div>
    </main>
  );
}
