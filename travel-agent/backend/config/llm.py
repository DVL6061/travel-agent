from agno.models.google import Gemini
from agno.models.openai import OpenAIChat
from agno.models.openrouter import OpenRouter
from agno.models.groq import Groq
# from agno.models.ollama import Ollama

# ============================================
# OPTION 1: OpenRouter Models (PAID/CREDITS REQUIRED)
# ============================================
# model = OpenRouter(id="google/gemini-2.0-flash-001", temperature=0.3, max_tokens=8096)
# model2 = OpenRouter(id="openai/gpt-4o", temperature=0.1, max_tokens=8096)
# model_zero = OpenRouter(
#     id="google/gemini-2.0-flash-001", temperature=0.1, max_tokens=8096
# )

# free trail on openrouter model
# --- New Configuration (Free Models) - CURRENTLY ACTIVE ---
# We are using the FREE model: openai/gpt-oss-120b:free
# Increased max_tokens to 8192 to ensure long itineraries are not cut off.
#model = OpenRouter(id="openai/gpt-oss-120b:free", temperature=0.3, max_tokens=8192)
#model2 = OpenRouter(id="openai/gpt-oss-120b:free", temperature=0.1, max_tokens=8192)
#model_zero = OpenRouter(
#    id="openai/gpt-oss-120b:free", temperature=0.1, max_tokens=8192
#)

# ============================================
# OPTION 2: OpenAI Models (DIRECT) 
# ============================================
# model = OpenAIChat(id="gpt-4o", temperature=0.3)
# model2 = OpenAIChat(id="gpt-4o-mini", temperature=0.1)
# model_zero = OpenAIChat(id="gpt-4o", temperature=0.1)

# ============================================
# OPTION 3: Google Gemini Models (FREE!) - CURRENTLY ACTIVE
# ============================================
# Note: Ensure GOOGLE_API_KEY is set in your .env file
# Verified available models: gemini-2.0-flash, gemini-2.0-flash-lite, etc.
# Using 'lite' model to maximize quota availability on free tier.
# model = Gemini(id="gemini-2.0-flash-lite", temperature=0.3)
# model2 = Gemini(id="gemini-2.0-flash-lite", temperature=0.1)
# model_zero = Gemini(id="gemini-2.0-flash-lite", temperature=0.1)

# ============================================
# OPTION 4: Groq Models (FREE & INSANELY FAST!) - CURRENTLY ACTIVE
# ============================================
# Using llama-3.1-8b-instant for maximum RPD quota (14,400)
#groq_model = Groq(id="llama-3.1-8b-instant")
#groq_model_fast = Groq(id="llama-3.1-8b-instant")

# ============================================
# OPTION 5: Local Models (OLLAMA) 
# ============================================
# Download Ollama from: https://ollama.com/
# Run 'ollama run llama3.2' first. No API key needed!
# local_model = Ollama(id="llama3.2")

# ACTIVE MODEL SELECTION
# Using llama-4-scout-17b-16e-instruct from the Free Tier
# It offers the BEST balance for this project: 30,000 TPM (solves token limits) 
# and 30 RPM (solves speed limits).
model = Groq(id="meta-llama/llama-4-scout-17b-16e-instruct")
model2 = Groq(id="meta-llama/llama-4-scout-17b-16e-instruct")
model_zero = Groq(id="meta-llama/llama-4-scout-17b-16e-instruct")

# --- PREVIOUS SELECTION (FOR REVERT) ---
# model = Groq(id="llama-3.3-70b-versatile")
# model2 = Groq(id="llama-3.1-8b-instant")
# model_zero = Groq(id="llama-3.1-8b-instant")
