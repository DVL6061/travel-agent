# TripCraft AI Backend

FastAPI backend for the TripCraft AI Travel Planner with multi-agent architecture.

## Features

- Multi-agent system using Agno framework
- PostgreSQL database with SQLAlchemy
- RESTful API endpoints
- Integration with OpenRouter, Exa Search, and Firecrawl APIs

## Setup

1. Create virtual environment: `python -m venv venv`
2. Activate: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/macOS)
3. Install dependencies: `uv pip install -e .`
4. Configure `.env` file with your API keys
5. Run: `python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
