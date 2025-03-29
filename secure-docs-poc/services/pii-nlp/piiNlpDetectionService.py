from flask import Flask, request, jsonify
import tempfile

app = Flask(__name__)

@app.route('/detect-nlp-docx', methods=['POST'])
def detect_nlp():
    file = request.files.get('file')
    if not file:
        return jsonify({ 'error': 'No file uploaded' }), 400

    with tempfile.NamedTemporaryFile(delete=False) as temp:
        file.save(temp.name)

    # Stubbed response for testing gateway
    redacted_text = "This is a [NAME_0] with fake [EMAIL_0]"
    mappings = [
        {"type": "name", "original": "John Smith", "placeholder": "[NAME_0]"},
        {"type": "email", "original": "john@example.com", "placeholder": "[EMAIL_0]"}
    ]

    return jsonify({
        'redactedText': redacted_text,
        'mappings': mappings
    })

if __name__ == '__main__':
    app.run(port=3009)
