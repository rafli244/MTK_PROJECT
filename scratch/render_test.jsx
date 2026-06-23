import React from 'react';
import { renderToString } from 'react-dom/server';
import CryptoLab from '../src/components/CryptoLab.jsx';

try {
  console.log("Attempting to render CryptoLab with empty password...");
  const html1 = renderToString(React.createElement(CryptoLab, { inputPassword: "" }));
  console.log("Successfully rendered with empty password!");

  console.log("Attempting to render CryptoLab with 'budi123'...");
  const html2 = renderToString(React.createElement(CryptoLab, { inputPassword: "budi123" }));
  console.log("Successfully rendered with 'budi123'!");
} catch (error) {
  console.error("Render failed with error:", error);
}
