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
    template="You are an advance chatbot that interacts with the user like a human. Answer the user query based on the provided context and chat history.\n{format_instructions}\n latest user input : {query}\n. the quer is the user's input in the chatbot now answer this and also give the reply to carry on the conversation, \n chat history : {query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

def get_response(context, user_query, chat_history):
    chain = prompt | model | parser
    response = chain.invoke({
        "context": context,
        "chat_history": chat_history,
        "query": user_query,
    })
    return response.get("response", "problem with api")

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    # print(" received")
    user_query = data['message']
    chat_history = data.get('chat_history', [])
    context = "Provide any context if needed"
    response = get_response(context, user_query, chat_history)
    # print("hello start")
    print(response)
    return jsonify({"message": response})

if __name__ == '__main__':
    app.run(debug=True)
    # app.run(port=5000)
