import React, { useState, useEffect, useRef } from 'react';

const InfrastructureTerminal = () => {
  // This is the data you want to stream. 
  // It could be Terraform code, JSON, or system logs.
  const logLines = [
    "> Initializing Nebula Engine...",
    "> Loading modules: [Net, IO, Crypto]...",
    "> Allocating resources in cluster 'us-east-1'...",
    "const cluster = new Nebula.Cluster({",
    "  nodes: 12,",
    "  memory: '64GB',",
    "  autoScale: true",
    "});",
    "> Waiting for node provisioning...",
    "> [SUCCESS] Node 1 Online (ID: xe-99)",
    "> [SUCCESS] Node 2 Online (ID: xe-100)",
    "> Establishing secure handshake...",
    "> System Ready."
  ];

  const [displayedText, setDisplayedText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    // If we have displayed all lines, stop (or you can reset to loop)
    if (lineIndex >= logLines.length) return;

    const currentLine = logLines[lineIndex];

    const timeout = setTimeout(() => {
      // Add the next character
      setDisplayedText((prev) => prev + currentLine.charAt(charIndex));
      
      // Move to next character
      if (charIndex < currentLine.length - 1) {
        setCharIndex(charIndex + 1);
      } else {
        // Line finished, move to next line after a small pause
        setDisplayedText((prev) => prev + "\n");
        setLineIndex(lineIndex + 1);
        setCharIndex(0);
      }
    }, 30); // Typing speed (lower is faster)

    // Auto-scroll to the bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    return () => clearTimeout(timeout);
  }, [charIndex, lineIndex, logLines]);

  return (
    <div 
      ref={scrollRef}
      style={{
        backgroundColor: '#0f172a', // Dark background
        color: '#10b981',           // Matrix Green or standard Terminal White
        fontFamily: 'monospace',    // Crucial for the code look
        padding: '16px',
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        fontSize: '14px',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap'      // Preserves formatting
      }}
    >
      {displayedText}
      {/* The blinking cursor effect */}
      <span className="animate-pulse">_</span>
    </div>
  );
};

export default InfrastructureTerminal;