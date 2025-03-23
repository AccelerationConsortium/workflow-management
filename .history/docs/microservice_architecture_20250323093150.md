Canvas UI
   │
   ▼
API Gateway
   │
   ├── Auth Service
   ├── Workflow Service
   │     └── Simulation Service
   │     └── Execution Monitor / Event Log
   ├── Validation Service
   │     ├── Schema Validator
   │     └── Runtime Validator
   ├── LCP (Hardware Control)
   ├── Data Storage
   ├── Computation Service
   └── Notification Service (optional)
        |
        └── Webhook / Email / WebSocket

LLM / multi-agent 可以作为 策略引擎 插在 Workflow Service 和 Validation 之间。
