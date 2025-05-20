#!/usr/bin/env python
import os, pathlib, typer
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

load_dotenv()

VECTOR_DIR = os.getenv("VECTOR_DIR", "./vector_store")

app = typer.Typer()

@app.command()
def build(
    docs_dir: pathlib.Path = typer.Argument(
      pathlib.Path("docs"),
      exists=True,
      resolve_path=True,
      help="Folder containing .md knowledge-base files",
    ),
    clean: bool = typer.Option(False, "--clean", "-c", help="Delete existing vector DB first"),
):
  vector_dir = pathlib.Path(os.getenv("VECTOR_DIR", "./vector_store")).resolve()
  if clean and pathlib.Path(VECTOR_DIR).exists():
    typer.echo("Cleaning vector store…")
    import shutil; shutil.rmtree(VECTOR_DIR)

  splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
  loader = DirectoryLoader(str(docs_dir), glob="**/*.md", loader_cls=TextLoader)
  docs = loader.load_and_split(text_splitter=splitter)

  embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
  Chroma.from_documents(docs, embedding=embeddings, persist_directory=str(vector_dir))

  typer.echo(f"Indexed {len(docs)} chunks into {vector_dir}")

if __name__ == "__main__":
  app()
