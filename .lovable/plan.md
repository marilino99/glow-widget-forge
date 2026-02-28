

## Add gradient chart to "Live Insights" card

Copy the uploaded chart image to `src/assets/` and display it in the lower part of the "Live insights into your team and AI" card in the AIControl section.

### Steps

1. **Copy the image** from `user-uploads://Screenshot_2026-02-28_at_13.59.52.png` to `src/assets/insights-chart.png`

2. **Update `src/components/landing/AIControl.tsx`**:
   - Import the new asset: `import insightsChart from "@/assets/insights-chart.png";`
   - Add an `<img>` tag below the description text in the third card (the one with `backgroundColor: "#f4f3f3"`), displaying the chart with rounded corners and full width

