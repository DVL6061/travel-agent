from firecrawl import FirecrawlApp
import os
from agno.tools import tool
from loguru import logger
from config.logger import logger_hook

app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))


@tool(
    name="scrape_website",
    description="Scrape a website and return the markdown content.",
    tool_hooks=[logger_hook],
)
def scrape_website(url: str) -> str:
    """Scrape a website and return the markdown content.

    Args:
        url (str): The URL of the website to scrape.

    Returns:
        str: The markdown content of the website.

    Example:
        >>> scrape_website("https://www.google.com")
        "## Google"
    """
    try:
        scrape_status = app.scrape(
            url,
            formats=["markdown"],
        )
        # Handle both dict and Document object response types
        if hasattr(scrape_status, 'markdown'):
            return scrape_status.markdown or "No content found"
        elif isinstance(scrape_status, dict):
            return scrape_status.get("markdown", "No content found")
        return "No content found"
    except Exception as e:
        logger.error(f"Firecrawl scrape error for {url}: {e}")
        return f"Error scraping website: {str(e)}"
