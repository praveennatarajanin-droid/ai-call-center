import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import axios from 'axios';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Step = 'idle' | 'menu' | 'awaiting_problem' | 'processing';

const VoiceOrb = ({ isSpeaking, isListening }: { isSpeaking: boolean, isListening: boolean }) => (
  <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
    <div 
      className={`absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 blur-md opacity-60 ${isSpeaking || isListening ? 'animate-[pulseOrb_2s_ease-in-out_infinite]' : ''}`}
      style={{
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
      }}
    />
    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative border border-white/20">
       <div className="absolute inset-1 rounded-full bg-[#141e32]" />
       {isListening ? (
         <Mic size={28} className="text-white relative z-10 animate-bounce" />
       ) : isSpeaking ? (
         <div className="flex gap-1.5 relative z-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: '14px', animationDelay: `${i * 0.1}s` }} />
            ))}
         </div>
       ) : (
         <div className="w-2 h-2 rounded-full bg-blue-400/50 relative z-10" />
       )}
    </div>
  </div>
);

export default function WebVoiceButton({ userType = 'parent' }: { userType?: string }) {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('idle');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const IVR_MENU = `
    Welcome to Nexus Health System.
    Press 1 for general health query,
    Press 2 for symptoms,
    Press 3 for medication issues,
    Press 4 for appointment,
    Press 5 for emergency,
    Press 6 for complaints,
    Press 7 for feedback,
    Press 8 for other medical queries,
    Press 9 to talk to admin.
  `;

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = (err) => {
        console.error('Speech synthesis error:', err);
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) return;
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error('Recognition start error:', err);
    }
  }, [recognition]);

  const handleOptionSelected = useCallback((option: number) => {
    window.speechSynthesis.cancel();
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
    }
    setIsListening(false);
    
    setSelectedOption(option);
    
    if (option === 9) {
      setIsKeypadOpen(false);
      setCurrentStep('idle');
      window.location.href = "tel:+919600097807";
      return;
    }

    setCurrentStep('awaiting_problem');
    speakText("Please describe your problem", () => {
      startListening();
    });
  }, [recognition, speakText, startListening]);

  const processFinalInteraction = useCallback(async (text: string) => {
    setIsLoading(true);
    setCurrentStep('processing');
    try {
      const res = await axios.post('http://localhost:5000/api/ai/voice', { 
        text, 
        userType,
        option: selectedOption
      });
      
      const { response } = res.data;
      speakText(response, () => {
        setTimeout(() => {
            setIsKeypadOpen(false);
            setCurrentStep('idle');
            setSelectedOption(null);
        }, 1500);
      });
    } catch (error) {
      console.error('Failed to process voice:', error);
      speakText("I'm sorry, there was a network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userType, selectedOption, speakText]);

  const detectOption = (text: string) => {
    const lower = text.toLowerCase();
    const map: Record<string, number> = {
      'one': 1, '1': 1, 'two': 2, '2': 2, 'three': 3, '3': 3,
      'four': 4, '4': 4, 'five': 5, '5': 5, 'six': 6, '6': 6,
      'seven': 7, '7': 7, 'eight': 8, '8': 8, 'nine': 9, '9': 9,
      'option 1': 1, 'option 2': 2, 'option 3': 3, 'option 4': 4, 'option 5': 5, 'option 6': 6, 'option 7': 7, 'option 8': 8, 'option 9': 9
    };
    for (const key in map) {
      if (lower.includes(key)) return map[key];
    }
    return null;
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        console.log('Recognized speech:', text);
        setIsListening(false);
        
        if (currentStep === 'menu') {
          const option = detectOption(text);
          if (option) {
            handleOptionSelected(option);
          } else {
            speakText("I didn't catch that. Please select an option from 1 to 9.", () => {
              startListening();
            });
          }
        } else if (currentStep === 'awaiting_problem') {
          await processFinalInteraction(text);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          speakText("I couldn't hear you clearly. Could you please try again?");
        }
      };

      setRecognition(recognitionInstance);
    }
  }, [currentStep, handleOptionSelected, processFinalInteraction, speakText, startListening]);

  const handleStartVoice = () => {
    setIsKeypadOpen(true);
    setCurrentStep('menu');
    speakText(IVR_MENU, () => {
      startListening();
    });
  };

  const closeModal = () => {
    setIsKeypadOpen(false);
    setCurrentStep('idle');
    window.speechSynthesis.cancel();
    if (recognition) { try { recognition.stop(); } catch(e) {} }
  };

  return (
    <>
      <button
        id="start-voice-interaction"
        onClick={handleStartVoice}
        disabled={isLoading || isSpeaking || isListening || isKeypadOpen}
        className={`flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 text-sm font-bold active:scale-95 ${
          isKeypadOpen ? 'text-primary' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Mic size={18} />
        <span>Voice Assistant</span>
      </button>

      {isKeypadOpen && (
        <div 
          className="modal-overlay fixed top-0 left-0 w-full h-[100vh] z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[6px] animate-in fade-in duration-300 pointer-events-auto"
          onClick={closeModal}
        >
          <div 
            className="w-[280px] bg-[rgba(20,30,50,0.95)] border border-white/10 p-5 rounded-[20px] relative shadow-[0_0_40px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-200 m-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <VoiceOrb isSpeaking={isSpeaking} isListening={isListening} />

            <div className="text-center mb-5">
              <h3 className="text-xl font-bold text-white mb-0.5">Nexus Health</h3>
              <p className="text-[11px] text-[#60a5fa] uppercase font-bold tracking-widest leading-none">Medical Support AI</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleOptionSelected(num)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 border ${
                    selectedOption === num 
                      ? 'bg-[#3b82f6] border-[#60a5fa] text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 active:scale-90'
                  }`}
                >
                  <span className="text-xl font-bold leading-none mb-1">{num}</span>
                  <span className="text-[9px] uppercase tracking-tighter text-white/70 font-bold leading-none">
                    {num === 1 ? 'Health' : num === 2 ? 'Symptoms' : num === 3 ? 'Meds' : num === 4 ? 'Appt' : num === 5 ? 'SOS' : num === 6 ? 'Issue' : num === 7 ? 'Rate' : num === 8 ? 'Other' : 'Admin'}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-2">
              <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isListening || isSpeaking ? 'text-[#60a5fa] animate-[blink_1s_infinite]' : 'text-slate-500'}`}>
                {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Waiting..."}
              </p>
              <p className="text-center text-[10px] text-white/50 font-medium italic leading-none">
                {currentStep === 'menu' ? 'Select your option' : currentStep === 'awaiting_problem' ? 'Please describe your concern' : 'Processing request...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
