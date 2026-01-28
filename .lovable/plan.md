
# Product Recommendation Widget Builder

A clean, minimal SaaS platform that lets users create customizable product recommendation popups they can embed on any website to drive sales.

---

## Phase 1: Core Builder Experience

### Landing Page
- Hero section explaining the value: "Create product recommendation popups that convert"
- Feature highlights (visual customization, smart triggers, A/B testing)
- Call-to-action to sign up or try the builder
- Clean, minimal design with lots of whitespace

### Authentication
- Sign up / Login with email
- Simple onboarding flow

### Widget Builder Dashboard
- List of saved widgets with quick stats
- Create new widget button
- Clean sidebar navigation

### Visual Widget Builder
**Live Preview Panel**
- Real-time preview of the modal popup widget as users customize it
- Shows exactly how it will appear on their site

**Customization Options**
- **Layout**: Choose number of products to display (2, 3, 4)
- **Colors**: Primary color, background, text color
- **Typography**: Font style, heading/body sizes
- **Borders & Shadows**: Corner radius, shadow depth
- **Position**: Center, bottom-right, custom positioning
- **Close button style**

---

## Phase 2: Products & Triggers

### Product Management
- Manual product entry to start (name, image URL, price, link)
- E-commerce integration setup (connect Shopify or WooCommerce store)
- Import products from connected store
- Select which products to feature in each widget

### Behavior Triggers
- **Time delay**: Show after X seconds on page
- **Scroll depth**: Show after user scrolls X% of page
- **Exit intent**: Show when user moves to leave
- **Page URL rules**: Show only on specific pages
- Frequency capping (don't annoy repeat visitors)

---

## Phase 3: A/B Testing & Analytics

### A/B Testing
- Create variants of a widget (different products, colors, triggers)
- Automatic traffic splitting
- Dashboard showing which variant performs better

### Basic Analytics
- Impressions (how many times widget was shown)
- Clicks (how many times products were clicked)
- Conversion tracking (optional pixel/webhook)

---

## Phase 4: Embed & Publish

### Widget Deployment
- Generate unique embed code (single script tag)
- Copy-paste installation instructions
- Widget preview on sample site mockup

### Widget Management
- Pause/activate widgets
- Duplicate widgets for quick iteration
- Delete unused widgets

---

## Technical Approach

- **Frontend**: React with Tailwind CSS for the clean, minimal interface
- **Backend**: Lovable Cloud for authentication, database, and edge functions
- **E-commerce**: Edge functions to securely connect with Shopify/WooCommerce APIs
- **Widget Embed**: Lightweight JavaScript snippet that loads the widget on user sites
