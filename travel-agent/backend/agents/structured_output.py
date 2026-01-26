from typing import TypeVar, Type, Any
from pydantic import BaseModel
from agno.agent import Agent
from loguru import logger
from config.llm import model
import json
import re
from pydantic import ValidationError

T = TypeVar("T", bound=BaseModel)


def clean_json_string(json_str: str) -> str:
    """
    Clean a JSON string by extracting the first valid { } block and removing markdown.
    """
    # 1. Remove markdown code blocks if present
    json_str = re.sub(r"```(?:json)?\n?(.*?)```", r"\1", json_str, flags=re.DOTALL)
    
    # 2. Find the first occurrence of '{' and the last occurrence of '}'
    start_index = json_str.find('{')
    end_index = json_str.rfind('}')
    
    if start_index != -1 and end_index != -1:
        json_str = json_str[start_index:end_index + 1]
    
    return json_str.strip()


async def convert_to_model(input_text: str, target_model: Type[T]) -> str:
    """
    Convert input text into a specified Pydantic model using an Agno agent.

    Args:
        input_text (str): The input text to convert
        target_model (Type[T]): The target Pydantic model class

    Returns:
        str: A JSON string that matches the model schema
    """

    logger.info(
        f"Converting input text to model: {target_model.__name__} : {input_text}"
    )

    structured_output_agent = Agent(
        model=model,
        description=(
            "You are an expert at extracting structured travel planning information from unstructured, free-form user inputs. "
            "Given a detailed user message, travel description, or conversation, your goal is to accurately populate a predefined trip schema. "
        ),
        instructions=[
            "Your task is to convert the input text into a valid JSON that matches the model schema exactly.",
            "You must return ONLY the JSON object that matches the schema exactly - no other output.",
            "When formatting text fields, you must:",
            "- Use minimal, consistent formatting throughout",
            "- Apply appropriate list formatting",
            "- Format dates, times and structured data consistently",
            "- Structure text concisely and clearly",
        ],
        markdown=True,
        expected_output="""
            A valid JSON object that matches the provided schema.
            Text fields should be clean and consistently formatted.
            Do not include any explanations or additional text - return only the JSON object.
            Without ```json or ```
        """,
    )

    schema = target_model.model_json_schema()
    schema_str = json.dumps(schema, indent=2)

    # Create the prompt with model schema and clear instructions
    prompt = f"""
    Your task is to convert the input text into a valid JSON object that exactly matches the provided schema.
    Do not include any explanations or additional text - return only the JSON object.

    Model schema:
    {schema_str}

    Rules:
    - Output must be valid JSON
    - All required fields must be included
    - Field types must match schema exactly
    - No extra fields allowed
    - Validate all constraints (min/max values, regex patterns, etc)

    Text Formatting Requirements:
    - Use consistent, clean text formatting throughout all string fields
    - For list items, use bullet points (•) instead of asterisks (*)
    - Minimize indentation and whitespace in text fields
    - Use line breaks sparingly and consistently
    - Avoid formatting characters like asterisks (*) in text
    - Don't include unnecessary prefixes or labels in text content
    - Format times, dates, durations, and prices consistently
    - Make sure all fields contain data appropriate for their purpose

    URL Field Rules (CRITICAL):
    - For any 'url' field, only use actual URLs starting with http:// or https://
    - NEVER use "N/A", "n/a", "Not Available", or any placeholder text for URL fields
    - If no valid URL is found in the input, use an empty string "" for the url field
    - Extract URLs exactly as they appear in the source text

    Input text to convert:
    {input_text}
    """

    # Get structured response from the agent with retries
    max_retries = 5
    retry_delay = 30
    
    for attempt in range(max_retries):
        try:
            response = await structured_output_agent.arun(prompt)
            json_string = clean_json_string(response.content)
            logger.info(f"Structured output agent response: {json_string}")
            break
        except Exception as e:
            error_msg = str(e).lower()
            
            # Broad check for retryable errors
            retryable_keywords = ["429", "rate limit", "quota", "exhausted", "503", "500", "tool_use_failed"]
            is_retryable = any(kw in error_msg for kw in retryable_keywords)
            
            if is_retryable:
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (1.5 ** attempt)
                    logger.warning(f"Retryable error in structured output: '{error_msg}'. Waiting {wait_time:.1f}s before retry (Attempt {attempt+1}/{max_retries})...")
                    await asyncio.sleep(wait_time)
                    continue
            
            logger.error(f"Failed to get structured output after {attempt+1} attempts: {str(e)}")
            raise e
    
    try:

        # Parse the JSON string
        try:
            json.loads(json_string)
            return json_string

        except json.JSONDecodeError as json_err:
            logger.error(f"JSON parsing error at {json_err.lineno}:{json_err.colno}: {str(json_err)}")
            logger.error(f"Problematic JSON snippet: {json_string[:1000]}...") # Log first 1000 chars
            raise ValueError(f"Invalid JSON response at line {json_err.lineno}, col {json_err.colno}: {str(json_err)}")

    except Exception as e:
        logger.error(f"Failed to parse response into {target_model.__name__}: {str(e)}")
        raise ValueError(
            f"Failed to parse response into {target_model.__name__}: {str(e)}"
        )
