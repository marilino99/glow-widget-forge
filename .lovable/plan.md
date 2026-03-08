

# Product Cards in Chatbot Responses

## What
When a visitor asks about products, the chatbot should respond with clickable product image cards (like the screenshot: thumbnail images in a horizontal row within the chat bubble). Clicking a product opens its URL or sends the product name as a follow-up message.

## How It Works

### 1. Add a `metadata` column to `chat_messages`
A new JSONB column to store structured data alongside the text content. For product recommendations, this will contain an array of product cards:
```json
{
  "products": [
    { "title": "Green Dress", "imageUrl": "...", "productUrl": "...", "price": "€59" },
    { "title": "Red Dress", "imageUrl": "...", "productUrl": "...", "price": "€45" }
  ]
}
```

### 2. Update `chatbot-reply` edge function
- Fetch the widget owner's `product_cards` from the database
- Include product info (title, price, image, URL) in the system prompt so the AI knows what products are available
- Instruct the AI: when recommending products, output a special marker like `[PRODUCTS: title1, title2]` at the end of the response
- After getting the AI response, parse the marker, match product titles to actual product cards, and save the matched products in the `metadata` column
- Strip the marker from the visible text content

### 3. Update widget-loader `renderBBMessage` function
- Check if a message has `metadata.products`
- If so, render a horizontal row of clickable product thumbnail images below the text bubble
- Each thumbnail: rounded square image (~60px), clicking opens `productUrl` in a new tab
- Style matches the screenshot: images in a flex row with small gaps

### 4. Update builder preview (`WidgetPreviewPanel.tsx`)
- Same rendering logic for the chat view in the builder preview
- When a chat message has metadata with products, render the product thumbnails below the text

### 5. Update `get-chat-messages` edge function
- Include the `metadata` column in the SELECT query so the widget receives it during polling

## Technical Flow
```text
Visitor asks about products
  → chatbot-reply fetches product_cards for the user
  → Includes products in system prompt
  → AI responds with text + product marker
  → Parse marker → match to real products → save metadata
  → Widget polls → receives metadata → renders product thumbnails
```

