from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

from .settings import settings
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain_anthropic import ChatAnthropic
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma


@lru_cache(maxsize=1)
def get_chain() -> Any:
  """
  Build (or return cached) retrieval-augmented generation chain.
  Env vars must be loaded *before* the first call.
  """
  # 1. Embeddings (same model as indexer)
  embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
  )

  # 2. Vector store
  vectorstore = Chroma(
    persist_directory=Path(settings.VECTOR_DIR).expanduser().as_posix(),
    embedding_function=embeddings,
  )
  retriever = vectorstore.as_retriever(search_type="similarity", k=4)

  # 3. LLM (Anthropic ⇒ Claude)
  llm = ChatAnthropic(
    api_key=settings.ANTHROPIC_API_KEY,
    model_name=settings.ANTHROPIC_MODEL_NAME,
    temperature=0.2,
    max_tokens_to_sample=1024,
    max_retries=3,
  )

  # 4. Prompt + runnable chain
  rag_prompt = PromptTemplate.from_template(
    """You are an expert assistant who must answer *solely* from the context.

    <context>
    {context}
    </context>

    Question: {question}

    Answer in markdown (cite sources with [^]):"""
  )

  # Function to format documents into a string
  def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

  # Create a chain for retrieving and formatting context
  retrieval_chain = retriever | format_docs

  # Create a proper chain that has an invoke method
  class RagChainWithContext:
    def __init__(self, retriever, prompt, llm):
      self.retriever = retriever
      self.prompt = prompt
      self.llm = llm

    def invoke(self, query):
      # Get the context
      docs = self.retriever.invoke(query)
      
      # Preserve markdown formatting and links in context
      # Add document separators and maintain original formatting
      formatted_docs = []
      for i, doc in enumerate(docs):
          # Add a document identifier that can be referenced in citations
          doc_id = f"[^{i+1}]"
          # Preserve the original content with its markdown formatting
          formatted_docs.append(f"{doc_id} {doc.page_content}")
      
      # Join with double newlines to maintain markdown paragraph structure
      context = "\n\n".join(formatted_docs)

      # Run the prompt with context and query
      chain_input = {"context": context, "question": query}
      answer = (self.prompt | self.llm | StrOutputParser()).invoke(chain_input)

      # Return both the answer and context
      return {"answer": answer, "context": context}

  # The final chain
  generation_chain = RagChainWithContext(retriever, rag_prompt, llm)

  return generation_chain
