import posthog from "posthog-js";

posthog.init("phc_2MpEseLU5gXmDehBfI06stdVCsIbd7RWtQqi7qmvhue", {
  api_host: "https://eu.i.posthog.com",
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,
});

export default posthog;
