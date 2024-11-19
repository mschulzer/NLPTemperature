from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the GPT-2 model and tokenizer
model_name = "gpt2"
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model = GPT2LMHeadModel.from_pretrained(model_name)

@app.route('/generate', methods=['POST'])
def generate_text():
    # Get user input from the request
    data = request.json
    prompt = data.get("prompt", "")
    temperature = float(data.get("temperature", 1.0))
    max_length = int(data.get("max_length", 50))
    
    # Generate text with probabilities
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(
        inputs["input_ids"],
        max_length=max_length,
        temperature=temperature,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id,  # Use eos_token as pad_token
        do_sample=True
    )
    
    # Decode generated text
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Get probabilities for the next token
    with torch.no_grad():
        logits = model(**inputs).logits
        next_token_logits = logits[0, -1, :] / temperature  # Apply temperature
        probabilities = torch.softmax(next_token_logits, dim=-1).tolist()
    
    # Extract top 10 tokens and their probabilities
    top_tokens = torch.topk(next_token_logits, k=10)
    top_indices = top_tokens.indices.tolist()
    top_probs = torch.softmax(top_tokens.values, dim=-1).tolist()
    top_words = [tokenizer.decode([idx]).strip() for idx in top_indices]
    
    probabilities_data = [{"token": word, "probability": prob} for word, prob in zip(top_words, top_probs)]
    
    return jsonify({
        "generated_text": generated_text,
        "probabilities": probabilities_data
    })

if __name__ == '__main__':
    app.run(debug=True)
