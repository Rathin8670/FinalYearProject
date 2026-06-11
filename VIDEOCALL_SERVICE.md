# Video Call Service Documentation

## 1. Overview
The **Video Call Service** is a specialized microservice responsible for creating and managing real-time video consultation sessions. It acts as a signaling server for WebRTC connections and manages the lifecycle of video rooms.

It is decoupled from the main Backend API to allow independent scaling of WebSocket connections, which are long-lived and resource-intensive.

## 2. Architecture

```mermaid
flowchart TD
    subgraph ClientLayer [Frontend Clients]
        DoctorBrowser[Doctor (Browser)]
        PatientBrowser[Patient (Browser)]
    end

    subgraph MainBackend [Core Platform]
        API[Backend API]
        DB[(MongoDB)]
    end

    subgraph VideoInfra [Video Service Cluster]
        Signaling[Node.js Signaling Server]
        Redis[(Redis Pub/Sub)]
    end

    DoctorBrowser -->|HTTP: Join Call| API
    PatientBrowser -->|HTTP: Join Call| API

    API -->|Internal HTTP: Create/Join Session| Signaling
    API -->|Read/Write Appt Status| DB

    Signaling -->|JWT Token| DoctorBrowser
    Signaling -->|JWT Token| PatientBrowser

    DoctorBrowser <-->|WebSocket: Signaling| Signaling
    PatientBrowser <-->|WebSocket: Signaling| Signaling

    DoctorBrowser <-->|WebRTC: P2P Media| PatientBrowser
```

---

## 3. Key Components

### 3.1. Session Management (REST API)
The service exposes internal REST endpoints protected by a shared secret (`INTERNAL_SECRET`). The main Backend API is the only authorized client for these endpoints.

*   `POST /sessions`: Creates a persistent session record linked to an `appointmentId`. It creates a unique `sessionId` and assigns a `roomName`.
*   `POST /sessions/:sessionId/join`: Generates a secure, short-lived JWT token for a specific user (`userId`) and role (`doctor` or `patient`) to join the room.

### 3.2. Signaling Server (Socket.IO)
A WebSocket server running on port 4000 (default) handles the exchange of WebRTC connection information:
*   **Events:** `join-room`, `offer`, `answer`, `ice-candidate`, `user-connected`, `user-disconnected`.
*   **Logic:** When Client A sends an `offer`, the server relays it specifically to the target client (or broadcasts to the room) to establish a peer-to-peer connection.

### 3.3. Authentication
*   **Service-to-Service:** Protected by `INTERNAL_SECRET` header.
*   **Client-to-Service:** Protected by JWT tokens signed with `VIDEO_JWT_SECRET`. The Socket.IO connection handshake requires this token to validate identity and room access.

---

## 4. Sequence Diagram: Starting & Joining a Call

```mermaid
sequenceDiagram
    participant Doc as Doctor
    participant Pat as Patient
    participant API as Backend API
    participant Video as Video Service

    Note over Doc, Video: Doctor Starts Call
    Doc->>API: POST /id/start-call
    API->>Video: POST /sessions (ApptID, DocID, PatID)
    Video->>Video: Check/Create Session
    Video-->>API: SessionID
    API-->>Doc: Join URL (with Token)

    Note over Pat, Video: Patient Joins Call
    Pat->>API: POST /id/join-call
    API->>Video: POST /sessions/:id/join (PatID)
    Video-->>API: Join URL (with Token)
    API-->>Pat: Join URL

    Note over Doc, Pat: Signaling & Media
    Doc->>Video: Connect WS (Token)
    Pat->>Video: Connect WS (Token)
    Doc->>Video: Send Offer
    Video->>Pat: Relay Offer
    Pat->>Video: Send Answer
    Video->>Doc: Relay Answer
    Doc<-->Pat: P2P Video Stream Established
```

## 5. Deployment & Scalability
*   **Stateless Scaling:** The REST API portion is stateless and can be horizontally scaled.
*   **WebSocket Scaling:** For multiple Signaling Nodes, a **Redis Adapter** is required to sync events across nodes (so a user on Node A can signal a user on Node B).
*   **Media Relay (SFU):** Currently configured for P2P (Mesh) or simple routing. For production with >3 participants, integration with an SFU (Selective Forwarding Unit) like LiveKit or Mediasoup is recommended.
