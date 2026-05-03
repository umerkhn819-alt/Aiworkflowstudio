1. AI Workflow Studio
Project Overview
AI Workflow Studio is a high-performance, full-stack automation platform designed to streamline developer workflows through a visual, node-based canvas. The system bridges the gap between complex AI model execution and user-friendly interface design, allowing for the rapid prototyping of AI-driven logic.

Core Features
Interactive Node Canvas: A custom-built React frontend that supports drag-and-drop node execution and visual logic mapping.

Advanced State Management: Integrated full undo/redo capabilities, local storage persistence, and session sharing via unique URLs.

AI Integration Engine: Robust backend endpoints (/api/ai/run) that interface with Gemma 3 APIs for real-time code generation and task automation.Also have implementation of mockAi which process realtime data when no API key is provided.

Data Portability: Full support for importing and exporting workflow configurations in JSON format.

Technical Stack
Frontend: React, Tailwind CSS, HTML5 Canvas.
Backend: Node.js, Express.
Database: MongoDB for persistent workflow storage.
AI Tools: Gemini API integration.
