import posthog from "posthog-js";

posthog.init("phc_2MpEseLU5gXmDehBfI06stdVCsIbd7RWtQqi7qmvhue", {
  api_host: "https://eu.i.posthog.com",
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,
  session_recording: {
    maskAllInputs: false,
    maskInputFn: (text, element) => {
      // Maschera i campi password
      if (element?.getAttribute("type") === "password") return "*".repeat(text.length);
      return text;
    },
  },
});

export default posthog;
