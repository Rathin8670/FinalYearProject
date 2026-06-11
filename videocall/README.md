# CarePulse Video Service 📹

A dedicated microservice for handling real-time video consultations between doctors and patients. It implements a Peer-to-Peer (P2P) WebRTC architecture facilitated by a Socket.IO signaling server.

## 🚀 Tech Stack

- **Signaling Server:** Node.js + Express + Socket.IO
- **Client Protocol:** WebRTC (RTCPeerConnection)
- **Transport:** UDP/TCP (via ICE Candidates)
- **Security:** JWT Authentication (for session validity)

## 🏗️ Architecture Explained

Most video call implementations require two distinct phases: **Signaling** (Handshake) and **Media Transport** (Video/Audio).

### 1. Signaling (Socket.IO)
Before two devices can exchange video, they must discover each other and agree on codecs/parameters. Since they cannot see each other on the internet directly (due to NATs/Firewalls), we use a **Signaling Server**.

- **Socket.IO** is used to create a real-time websocket channel.
- **Events:**
  - `join-room`: Authenticates user and puts them in a specific session room.
  - `user-connected`: Notifies existing users that a peer has joined.
  - `signal`: Relays WebRTC metadata (SDP Offers/Answers and ICE Candidates) between peers.

### 2. WebRTC (P2P Mesh)
Once the signaling exchange is complete, the browser establishes a direct connection to the other peer:

- **RTCPeerConnection:** The core browser API used.
- **ICE Candidates:** Network packets describing how to connect to a device (IP:Port).
- **SDP (Session Description Protocol):** Describes the media capabilities (Codec, Resolution).

**Flow:**
1.  **Offer:** Peer A creates an SDP Offer and sends it via Socket.IO.
2.  **Answer:** Peer B receives the Offer, sets it as remote description, creates an SDP Answer, and sends it back.
3.  **Connection:** Direct media stream (P2P) begins.

*Note: The architecture includes `sfuService` definitions for potential scaling to a Selective Forwarding Unit (SFU) model, but currently operates in Mesh (P2P) mode for minimal latency in 1:1 calls.*

## ✨ Features

- **Secure Access:** Users must possess a valid, signed JWT from the main backend to join.
- **Picture-in-Picture (PiP) Layout:**
    - Remote video fills the screen.
    - Local video is minimized in the bottom-right.
- **Controls:** Mute Audio, Disable Video, Leave Call.
- **Responsive:** Works on desktop and mobile browsers.

## 🛠️ Setup & Running

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file:
    ```env
    PORT=4000
    CLIENT_BASE_URL=http://localhost:3000
    INTERNAL_SECRET=your_backend_communication_secret
    ```

3.  **Run Service:**
    ```bash
    npm run dev
    ```
    Service runs at `http://localhost:4000`.

4.  **Usage:**
    Users are redirected here from the main Dashboard:
    `http://localhost:4000/join/<session_id>?token=<jwt_token>`
