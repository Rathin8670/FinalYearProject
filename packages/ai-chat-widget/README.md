# CarePulse AI Chat Widget 🧠

A reusable React component package that provides an intelligent floating assistant for the CarePulse application.

## 🚀 Overview

This package encapsulates the AI chat interface, commonly used to provide instant "Symptom Checking" or "General Support" to users on the frontend.

## 📦 Contents

- **Chat Interface:** A sleek, optimized chat UI with message bubbles and loading states.
- **Floating Button (FAB):** An animated trigger button that sits in the corner of the screen.
- **Integration:** Designed to easily plug into the Next.js `apps/web` application.

## 🛠️ Usage

Import the widget in your React application:

```tsx
import { AiChatWidget } from '@carepulse/ai-chat-widget';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <AiChatWidget />
    </>
  );
}
```

## 🔧 Configuration

The widget is pre-configured to communicate with the application's AI endpoints or specified LLM services. It handles its own state (open/close, message history) to keep the consumption simple.
