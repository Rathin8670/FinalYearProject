```mermaid
flowchart TD
    subgraph ClientLayer [Clients]
        WebClient[Web App (Next.js)]
        TelegramClient[Telegram App]
    end

    subgraph ServiceLayer [Microservices]
        API_GW[Backend API (Express)]
        VideoSvc[Video Service]
        AISvc[AI Service (Next.js/API)]
        BotSvc[Telegram Bot Service]
    end

    subgraph DataLayer [Data & Infra]
        MongoDB[(MongoDB)]
        Redis[(Redis)]
    end

    subgraph ExternalServices [External]
        OpenAI[OpenAI API]
        SFU[Video SFU/WebRTC]
    end

    WebClient -->|HTTP/REST| API_GW
    WebClient -->|WS/WebRTC| VideoSvc
    WebClient -->|HTTP| AISvc
    TelegramClient -->|Messages| BotSvc

    API_GW --> MongoDB
    API_GW --> Redis
    
    BotSvc -->|Internal HTTP| API_GW
    BotSvc --> Redis
    BotSvc -->|HTTP| OpenAI

    VideoSvc -->|Internal HTTP| API_GW
    VideoSvc --> SFU

    AISvc -->|HTTP| OpenAI
    AISvc -->|Context| MongoDB
```

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API as Backend API
    participant Mongo as MongoDB
    participant Video as Video Service
    participant AI as AI Service
    participant Bot as Telegram Bot

    Note over User, Bot: Full System Lifecycle

    User->>Frontend: Login (Credentials)
    Frontend->>API: POST /auth/signin
    API->>Mongo: Verify User
    Mongo-->>API: User Data
    API-->>Frontend: JWT Token

    User->>Frontend: Book Appointment
    Frontend->>API: POST /appointments
    API->>Mongo: Create Appointment
    Mongo-->>API: Appt ID
    API-->>Frontend: Success

    Note over User, Video: Video Consultation
    User->>Frontend: Join Call
    Frontend->>API: POST /appointments/:id/join-call
    API->>Video: Create/Join Session
    Video-->>API: Join URL / Token
    API-->>Frontend: Return URL
    Frontend->>Video: Connect (WebRTC)

    Note over User, AI: Post-Consultation / Help
    User->>Frontend: Open AI Chat
    Frontend->>AI: POST /api/ai/chat (Query)
    AI->>API: Fetch Medical Context (Optional)
    AI-->>Frontend: Response
```

```mermaid
sequenceDiagram
    participant User
    participant Bot as Telegram Bot
    participant LLM as OpenAI
    participant API as Backend API
    participant Redis

    User->>Bot: /start
    Bot-->>User: Please link account (/link CODE)

    User->>Bot: /link 12345
    Bot->>API: POST /auth/telegram/link
    API-->>Bot: Linked Successfully
    Bot-->>User: Account Linked!

    User->>Bot: "I want to see Dr. Smith tomorrow at 10am"
    Bot->>LLM: Parse Intent (JSON)
    LLM-->>Bot: { doctor: "Smith", date: "YYYY-MM-DD", time: "10:00" }
    
    Bot->>API: GET /doctors/search?name=Smith
    API-->>Bot: Doctor Details (ID)

    Bot->>API: POST /appointments (PatientID, DrID, Time)
    
    alt Slot Available
        API-->>Bot: Appt Confirmed
        Bot-->>User: Booked! ID: #1234
    else Slot Taken
        API-->>Bot: 409 Conflict (Suggested Slots)
        Bot-->>User: Slot taken. Try 11:00 or 14:00?
    end
```

```mermaid
flowchart TD
    User([User])
    FAB[Floating Action Button]
    Modal[AI Chat Modal]
    AppAPI[Next.js API Route /api/ai/chat]
    LLM[OpenAI GPT-4Vision]

    User -->|Clicks| FAB
    FAB -->|Opens| Modal
    User -->|Uploads PDF/Image + Text| Modal
    Modal -->|POST FormData| AppAPI
    
    subgraph AIServiceLogic
        AppAPI -->|PDF Parse/OCR| ContextBuilder[Context Builder]
        ContextBuilder -->|System Prompt + Context| LLM
        LLM -->|Safety Check & Response| AppAPI
    end

    AppAPI -->|JSON Reply| Modal
    Modal -->|Display| User
```

```mermaid
sequenceDiagram
    participant Doc as Doctor (Host)
    participant Pat as Patient (Guest)
    participant UI as Web Frontend
    participant API as Backend API
    participant Video as Video Service

    Doc->>UI: Click "Start Call"
    UI->>API: POST /appointments/:id/start-call
    API->>Video: POST /sessions (ApptID)
    Video-->>API: SessionID + HostToken
    API->>Mongo: Save videoMeetingId
    API-->>UI: Join URL (Host)
    UI->>Video: Connect WebSocket/Stream

    Pat->>UI: Click "Join Call"
    UI->>API: POST /appointments/:id/join-call
    API->>Mongo: Check Ownership & videoMeetingId
    Mongo-->>API: OK
    API->>Video: POST /sessions/:id/join
    Video-->>API: GuestToken
    API-->>UI: Join URL (Guest)
    UI->>Video: Connect WebSocket/Stream
```

```mermaid
erDiagram
    USER ||--o{ APPOINTMENT : "books (as patient)"
    USER ||--o{ DOCTOR : "is associated with (if doctor)"
    USER {
        ObjectId _id
        String email
        String password
        String role
        String telegramId
    }

    DOCTOR ||--o{ APPOINTMENT : "has schedule"
    DOCTOR {
        ObjectId _id
        ObjectId user_ref
        String specialization
        Number experience
        Object availability
    }

    APPOINTMENT ||--o| VIDEOSESSION : "triggers"
    APPOINTMENT {
        ObjectId _id
        ObjectId patient_ref
        ObjectId doctor_ref
        Date appointmentDate
        String status
        String videoMeetingId
    }

    VIDEOSESSION {
        String sessionId
        ObjectId appointment_ref
        String status
        Array participants
    }
```

```mermaid
mindmap
  root((CarePulse Project))
    apps
      web
        app
          dashboard
          api
            ai
        lib
          api.ts
        components
    backend
      config
      controllers
      models
      routes
      middleware
      index.js
    videocall
      src
        controllers
        routes
        services
        index.ts
    telegram-appointment-bot
      src
        bot.ts
        services
      setup-auth.js
```

```mermaid
flowchart TB
    subgraph DockerHost [Docker Host / Cloud VM]
        LB[Load Balancer / Nginx]
        
        subgraph AppContainer [App Service]
            NextJS[Next.js Frontend :3000]
        end
        
        subgraph BackendCluster [Backend Cluster]
            API[Backend API :5000]
            Video[Video Service :4000]
            Bot[Telegram Bot Worker]
        end

        subgraph Data [Persistence]
            Mongo[(MongoDB Container)]
            Redis[(Redis Container)]
        end
    end

    Internet((Internet)) -->|HTTPS/443| LB
    LB -->|/api| API
    LB -->|/| NextJS
    LB -->|/socket| Video

    API --> Mongo
    API --> Redis
    Video --> Redis
    Bot --> API
    Bot --> OpenAI[OpenAI Cloud]
```
