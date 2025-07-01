# Roadmap

#### Minimal AI workflow
```plantuml
@startuml
!includeurl https://raw.githubusercontent.com/proveo-ca/identity/refs/heads/main/proveo.iuml

actor User
component "React UI\n(Vite)" as UI
component "Fastify API" as API
component "Vector\nStore" as VS
database "Docs\n(.md)" as MD
cloud "Llama 3\n(via Ollama or HF\nendpoint)" as LLM
queue "Ingest Worker" as ING

User --> UI : " Question"
UI --> API : /ask?q=...
API --> VS : nearest-neighbors
API --> LLM : {prompt + context}
LLM --> API : answer
API --> UI : answer + refs

MD --> ING : " file-watcher"
ING --> VS : chunks + embeddings
@enduml
```

#### Enter adaptive UIs
```plantuml
@startuml
!includeurl https://raw.githubusercontent.com/proveo-ca/identity/refs/heads/main/proveo.iuml

' 👤  ACTORS ----------------------------------------------------
actor "Student\n(End-User)" as Student
actor "Task Runner" as TaskRunner
actor "Scraper" as Scraper
actor "UI Architect" as UIArchitect

' 🏗️  NODES / CONTAINERS --------------------------------------
node "Frontend\nReact" as FE {
}

node "API Server\nFastAPI" as API {
}

node "Vector Store\nChromaDB" as VS
node "Embedding Model\n(Ollama / OpenAI)" as EMB
node "Scheduler / Queue\nCelery + Redis" as SCH
node "Scraper Engine\nPlaywright" as SCR
database "Storage\n(PostgreSQL +\nMinIO)" as ST

' 📥  Upload flow ---------------------------------------------
Student ..> FE : (1) Upload PDFs (.zip)
FE ..> API : HTTP POST /materials
API ..> SCH : enqueue <update_vstore>
SCH ..> TaskRunner : run job
TaskRunner ..> EMB : Generate embeddings
TaskRunner ..> VS : Upsert vectors
TaskRunner ..> ST : Save metadata / text chunks
TaskRunner --> SCH : job status: done

' 🔍  Digest request flow --------------------------------------
Student -> FE : (2) Ask: “'Explain chapter 3...'  ”
FE --> API : (3) HTTP POST /digest
API -> VS : (4) similarity search (RAG)
API ---> UIArchitect : (5) decide layout + component list
UIArchitect -> API : (6) JSON layout plan Array<{weight, content, source}>
API ---> SCR : (7) need external sources for empty comps
SCR ---> Scraper : (8) fetch URLs with citations
Scraper ---> API : (9) enriched component data
API --> FE : (10) Final JSON Array<{weight, content, source}>

' ⛓️  Front-end render -----------------------------------------
FE --> Student : Masonry / adaptive UI

UIArchitect -[hidden]down-> Scraper

@enduml
```

#### Agentic autonomy
```plantuml
@startuml
!includeurl https://raw.githubusercontent.com/proveo-ca/identity/refs/heads/main/proveo.iuml

' ───────────────────  ACTORS (Autonomous Agents)  ───────────────────
actor "Student" as Student
actor "Task Runner Agent" as TaskRunner
actor "Scraper Agent" as Scraper
actor "UI Architect Agent" as UIArchitect
actor "Evaluator / Guardrails" as Evaluator

' ───────────────────  SYSTEM NODES / CONTAINERS  ───────────────────
cloud "Agent Orchestrator\n(LangGraph / CrewAI)" as Orchestrator
node  "Vector Store\nChroma"            as VS
database "Knowledge & Files\n(PostgreSQL + MinIO)" as Storage
node  "Embedding Model\nOllama / OpenAI" as EMB
queue "Task Queue\nFastQueue"           as Queue
database "Observability\nPrometheus + Loki" as Obs

' ───────────────────  OBJECTIVE NOTES  ───────────────────
note right of TaskRunner
  **Objective**
  * Keep embeddings fresh  
  * Monitor backlog & self-schedule refresh  
  * Publish status to queue
end note

note right of Scraper
  **Objective**
  * Populate empty UI components  
  * Guarantee citation-accurate data  
  * Retry with alt queries if quality < threshold
end note

note right of UIArchitect
  **Objective**
  * Select layout per user intent  
  * Balance weight <-> clarity  
  * Emit component spec for downstream agents
end note

note right of Evaluator
  **Objective**
  * Run automatic schema & policy checks  
  * Perform spot-QA & hallucination tests  
  * Return *pass* / *revise* signals
end note

' ───────────────────  AGENTIC INTERACTIONS  ───────────────────
Student --> Orchestrator : User goal / query
Orchestrator --> TaskRunner : "Need fresh embeddings?"
Orchestrator --> UIArchitect : "Draft layout plan"
Orchestrator --> Scraper    : "Fill data gaps"
TaskRunner --> VS
TaskRunner --> Evaluator
UIArchitect --> VS
UIArchitect --> Evaluator
Scraper --> Storage
Scraper --> Evaluator
Evaluator --> Orchestrator : pass / revise
Orchestrator --> Student : Final response JSON

' ───────────────────  INFRA & OBSERVABILITY  ───────────────────
TaskRunner --> Queue
Scraper     --> Queue
UIArchitect --> Queue
TaskRunner --> EMB
Obs .. Evaluator   : metrics / audit
Obs .. Orchestrator: traces / health

@enduml
```
