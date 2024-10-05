This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# My TG Bot with Vercel UI

This project integrates a Discord bot with a web UI component deployed on Vercel. The bot listens for requests and triggers workflows based on VIP status and request count.
## New Feature: Quests for Earning Coins
## New Feature: Conflict Awareness and Humanitarian Support Componen
## New Feature: Dynamic Item Form

### Description:
This component allows users to dynamically fill out forms based on the type of item they are adding (e.g., car, bike, forklift). The form fields are dynamically generated based on the item type selected and are fetched from the database. The component integrates with Supabase to store item-specific data.

## Premium Custom Landing Pages

### Description
This component allows users to request and manage their premium custom landing pages. The landing pages are designed externally and integrated into the application, accessible via the user's profile. 

### Usage
To use this component, import it into the appropriate page or section of the application:

## New Feature: Crypto Payment Support

- **Description**: This component allows users to generate payment links for the TON network, enabling crypto payments for premium services like custom landing pages. The user receives a notification upon successful payment, and the requested feature is activated manually.
- **Usage**:

## New Feature: QR Code Sharing

### Description:
The `QrCodeForm` component allows users to generate a QR code that encodes the current form state. This QR code can be scanned on a different device to load the form with the same state, enabling seamless transitions between devices.

### Usage:
To use the `QrCodeForm` component, simply import and include it in the form you want to enable with QR code sharing:

## New Feature: Referral System for Custom Landing Pages

- **Description**: This feature allows users to generate referral links for specific custom landing pages. These links can be shared via QR codes or direct Telegram messages. When a new client signs up and purchases a premium feature through the referral, the user who generated the link earns a reward.

- **Usage**:

## New Feature: Payment Notification via Telegram Bot

### Description:
This component automatically sends a payment confirmation notification to the user via Telegram after they complete a crypto payment. The notification includes details about when their premium access will be activated.
### Description:
The `QuestsForCoins` component allows users to earn coins by completing various tasks, such as inviting friends through referrals or creating their first feature in dev mode. Each quest is presented with a description and an action button to initiate the task.

## Setup

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Build the project: `npm run build`
4. Export the project: `npm run export`

## Deployment

Deploy to Vercel by connecting your GitHub repository or manually uploading the project.
## MegaCard Component

### Features
The `MegaCard` component represents an interactive game card that supports complex gesture-based interactions:
- **Drag Gestures**: Regular card dragging is smooth with responsive movement.
- **Yeet Movement**: When the card is dragged downward and released quickly, it performs an exaggerated "yeet" with a flip and overshoots the release point.
- **Double-Tap Flip**: Tapping the card twice flips it over.

### Usage
The component expects `gameState` and `cardId` props along with a `syncTrajectory` function for updating the card's state during gameplay.
## AboutApp Component

This component provides an "About the App" modal with the following features:
- A small circular info button that opens the modal when clicked.
- The modal contains:
  - App title
  - Motto: *"The app is designed to create web3 environments freely, and commercial use is supported out of the box by crypto."*
  - A button that links to the app's GitHub project.
  - A version label displaying "App v. 0.13".
- The modal can be closed by clicking outside of it.

### Usage

Import the component and use it in your app:

```tsx
import AboutApp from '@/components/ui/AboutApp';

function App() {
  return (
    <div>
      <AboutApp />
      {/* Other components */}
    </div>
  );
}
```
## QuizComponent

The `QuizComponent` is a dynamic quiz designed for users to answer questions about LATOKEN. Each question is multiple-choice, and answers are submitted and stored in Supabase. User scores are tracked, and detailed feedback is provided for each question.

### Usage

```tsx
import QuizComponent from '@/components/game/QuizComponent';

<QuizComponent />;
```