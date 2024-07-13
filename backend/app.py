from flask import Flask, request, jsonify
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from dotenv import load_dotenv
from flask_cors import CORS
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

class ChatResponse(BaseModel):
    response: str = Field(description="Response from the chatbot")

api_token = os.getenv("OPEN_API_KEY")
model = ChatOpenAI(api_key=api_token, temperature=0.7)

parser = JsonOutputParser(pydantic_object=ChatResponse)
prompt = PromptTemplate(
    template="""
    You are an advanced chatbot acting as a language test examiner. Interact with the user like a human examiner.
    Pose questions based on the context and chat history, evaluate the user's responses, and provide feedback.
    After each user response, provide the next question or feedback to continue the conversation.
    
    your response should be like this example :
    {{
        "response":"your reply or next question or feedback to continue the conversation."
    }}

    if user wants to terminate or conclude the language test then just provide feedback based on the chat history and suggestions to help them improve and do not ask any further questions. Also give them a score between 0 to 9 if the test is in english else 0-25 if in french based on the chat history, grammer, lexical resouce, vocablury, grammer range and accuracy, fluency and coherence
    
    Context: {context}
    Latest user input: {query}
    Chat history: {chat_history}
    """,
    input_variables=["context", "query", "chat_history"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

def get_response(context, user_query, chat_history):
    chain = prompt | model | parser
    response = chain.invoke({
        "context": context,
        "query": user_query,
        "chat_history": chat_history,
    })
    print("+++++++++",response,"+++++++")
    return response.get("response", "Problem with API")

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_query = data['message']
    chat_history = data.get('chat_history', [])
    language = data.get('language', 'en')

    context = f"You are taking a demo language test in {language}. Please provide your reply as if you are in a real test scenario. Remember this is a speaking test. whatever the user is speaking i am passing to you after converting it to text similarly whatever response you will give in text i will convert it to speech then play it for the user. remeber this is just an introductory section where you will interact as an instructor to the candidate. this is not a listening test"
    response = get_response(context, user_query, chat_history)
    return jsonify({"message": response})

if __name__ == '__main__':
    app.run(debug=True)
