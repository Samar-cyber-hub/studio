
"use client";

import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  currentUtterance: SpeechSynthesisUtterance | null;
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
    }
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const loadAndSetVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        return; // Voices not loaded yet
      }
      // console.log("Available voices:", voices); // For debugging: to see what voices are available

      let foundVoice: SpeechSynthesisVoice | undefined;

      // Priority 1: 'en-IN'
      foundVoice = voices.find(voice => voice.lang === 'en-IN');

      // Priority 2: 'hi-IN'
      if (!foundVoice) {
        foundVoice = voices.find(voice => voice.lang === 'hi-IN');
      }

      // Priority 3: Name contains "India" (case-insensitive)
      if (!foundVoice) {
        foundVoice = voices.find(voice => voice.name.toLowerCase().includes('india'));
      }
      
      // Priority 4: Name contains "Hindi" (case-insensitive)
      if (!foundVoice) {
        foundVoice = voices.find(voice => voice.name.toLowerCase().includes('hindi'));
      }

      // Priority 5: Specific known voice names
      if (!foundVoice) {
        const knownIndianVoiceNames = [
          "Microsoft Heera - English (India)", // Windows
          "Google हिन्दी", // Android/Chrome often has this for Hindi
          "Rishi", // macOS Indian English
          // Add other known voice names if discovered
        ];
        foundVoice = voices.find(voice => knownIndianVoiceNames.includes(voice.name));
      }

      if (foundVoice) {
        setSelectedVoice(foundVoice);
        // console.log("Selected Indian voice:", foundVoice.name, foundVoice.lang);
      } else {
        // console.log("No specific Indian voice found, will use system default.");
        setSelectedVoice(null); // Fallback to default
      }
    };

    // Voices might load asynchronously.
    // The 'voiceschanged' event is the most reliable way to know when voices are ready.
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadAndSetVoices;
    }
    loadAndSetVoices(); // Attempt to load voices immediately as well

    return () => {
      if (isSupported && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; 
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentUtterance(null);
      };
      utterance.onerror = (event) => {
        if (event.error === 'interrupted') {
          // console.info("Speech synthesis interrupted:", event.error); 
        } else {
          console.error("Speech synthesis error:", event.error, event);
        }
        setIsSpeaking(false);
        setCurrentUtterance(null);
      };
      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setIsSpeaking(false);
      setCurrentUtterance(null);
    }
  }, [isSupported, selectedVoice]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentUtterance(null);
  }, [isSupported]);

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported, currentUtterance };
}
