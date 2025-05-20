# Roadmap

## Why?

To enhance the answering capabilities of Llama 3 using RAG + study/journal Markdown docs:

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
