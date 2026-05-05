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

  const currentStepRef = React.useRef<Step>('idle');
  const selectedOptionRef = React.useRef<number | null>(null);
  const userTypeRef = React.useRef(userType);

  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { selectedOptionRef.current = selectedOption; }, [selectedOption]);
  useEffect(() => { userTypeRef.current = userType; }, [userType]);

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

  const startListening = useCallback((rec: any) => {
    if (!rec) return;
    try {
      rec.start();
      setIsListening(true);
    } catch (err) {
      console.error('Recognition start error:', err);
    }
  }, []);

  const detectOption = (text: string): number | null => {
    const lower = text.toLowerCase();
    const map: Record<string, number> = {
      'one': 1, '1': 1, 'two': 2, '2': 2, 'three': 3, '3': 3,
      'four': 4, '4': 4, 'five': 5, '5': 5, 'six': 6, '6': 6,
      'seven': 7, '7': 7, 'eight': 8, '8': 8, 'nine': 9, '9': 9,
    };
    for (const key in map) {
      if (lower.includes(key)) return map[key];
    }
    return null;
  };

  const processFinalInteraction = useCallback(async (text: string) => {
    setIsLoading(true);
    setCurrentStep('processing');
    try {
      const res = await axios.post('http://localhost:5000/api/ai/voice', { 
        text, 
        userType: userTypeRef.current,
        option: selectedOptionRef.current
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
  }, [speakText]);

  const handleOptionSelected = useCallback((option: number, rec?: any) => {
    window.speechSynthesis.cancel();
    if (rec) {
        try { rec.stop(); } catch(e) {}
    }
    setIsListening(false);
    setSelectedOption(option);
    selectedOptionRef.current = option;
    
    if (option === 9) {
      setIsKeypadOpen(false);
      setCurrentStep('idle');
      window.location.href = "tel:+919600097807";
      return;
    }

    setCurrentStep('awaiting_problem');
    speakText("Please describe your problem", () => {
      startListening(rec);
    });
  }, [speakText, startListening]);

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
        
        if (currentStepRef.current === 'menu') {
          const option = detectOption(text);
          if (option) {
            handleOptionSelected(option, recognitionInstance);
          } else {
            speakText("I didn't catch that. Please select an option from 1 to 9.", () => {
              startListening(recognitionInstance);
            });
          }
        } else if (currentStepRef.current === 'awaiting_problem') {
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
  }, []);

  const handleStartVoice = () => {
    setIsKeypadOpen(true);
    setCurrentStep('menu');
    currentStepRef.current = 'menu';
    speakText(IVR_MENU, () => {
      startListening(recognition);
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
        style={{ 
          background: 'var(--glass-bg)', 
          border: '1px solid var(--border-color)',
          color: isKeypadOpen ? 'var(--primary-color)' : 'var(--text-title)',
          transition: 'all 0.3s'
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold active:scale-95 group"
      >
        <Mic size={18} className={isKeypadOpen ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
        <span className={isKeypadOpen ? 'text-primary' : 'group-hover:text-primary transition-colors'}>Voice Assistant</span>
      </button>

      {isKeypadOpen && (
        <div 
          className="modal-overlay fixed top-0 left-0 w-full h-[100vh] z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[6px] animate-in fade-in duration-300 pointer-events-auto"
          onClick={closeModal}
        >
          <div 
            className="w-[300px] p-6 rounded-[24px] relative shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 m-0"
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-color)',
              color: 'var(--text-title)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              className="absolute top-5 right-5 transition-colors hover:text-primary"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <VoiceOrb isSpeaking={isSpeaking} isListening={isListening} />

            <div className="text-center mb-6">
              <h3 className="text-xl font-black tracking-tighter mb-0.5" style={{ color: 'var(--text-title)' }}>Nexus AI</h3>
              <p className="text-[10px] text-primary uppercase font-black tracking-[0.2em] leading-none">Medical Node 01</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleOptionSelected(num, recognition)}
                  style={{ 
                    background: selectedOption === num ? 'var(--primary-color)' : 'var(--bg-main)',
                    borderColor: selectedOption === num ? 'var(--primary-color)' : 'var(--border-color)',
                    color: selectedOption === num ? '#000' : 'var(--text-title)'
                  }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 border shadow-sm active:scale-90`}
                >
                  <span className="text-lg font-black leading-none mb-1">{num}</span>
                  <span className="text-[8px] uppercase font-black tracking-tighter opacity-70">
                    {num === 1 ? 'Health' : num === 2 ? 'Symptoms' : num === 3 ? 'Meds' : num === 4 ? 'Appt' : num === 5 ? 'SOS' : num === 6 ? 'Issue' : num === 7 ? 'Rate' : num === 8 ? 'Other' : 'Admin'}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-3">
              <div className={`px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] ${isListening || isSpeaking ? 'text-primary animate-pulse' : 'text-slate-500'}`}>
                {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Idle"}
              </div>
              <p className="text-center text-[10px] font-bold italic leading-none opacity-50" style={{ color: 'var(--text-title)' }}>
                {currentStep === 'menu' ? 'Select interface option' : currentStep === 'awaiting_problem' ? 'Transmit concern data' : 'Processing signal...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
