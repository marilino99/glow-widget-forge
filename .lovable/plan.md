
## Clicking a FAQ Pill Opens the Chat with the Question

Currently, clicking a FAQ pill only sets `expandedFaqId` and hides the pills, but nothing visible happens because the expanded FAQ accordion is inside the home view, not the chat view.

### What will change

When a user clicks a FAQ pill above the bottom bar:
1. The pills will disappear
2. The chat view will open (`setShowChat(true)`)
3. The clicked question will be sent as a user message to the chat
4. The AI will respond with an answer, just like a normal chat message

### Technical details

**File: `src/components/builder/WidgetPreviewPanel.tsx`**

- Update the FAQ pill `onClick` handler (around line 859) to:
  - Call `setShowChat(true)` to open the chat view
  - Call `handleSendChatMessage(faq.question)` to send the question and get an AI response
  - Call `setShowFaqPills(false)` to hide the pills
  - Remove the `setExpandedFaqId(faq.id)` call since we no longer need the accordion behavior

- The existing `handleSendChatMessage` function already handles sending the message and displaying the AI response with typing indicators, so no other changes are needed.
