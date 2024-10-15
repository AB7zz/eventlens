from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
import firebase_admin
from firebase_admin import credentials, storage
import matplotlib.pyplot as plt
from io import BytesIO
from dotenv import load_dotenv
import telebot
import base64
import certifi

load_dotenv()
TELEGRAM_API = os.getenv('TELEGRAM_API')

bot = telebot.TeleBot(TELEGRAM_API)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

cred = credentials.Certificate(
    os.path.join(os.path.dirname(__file__), 'creds.json')
)

firebase_admin.initialize_app(cred, {
    'storageBucket': os.getenv('VITE_FIREBASE_STORAGE_BUCKET')
})

# Load FaceNet model
device = 'cuda' if torch.cuda.is_available() else 'cpu'
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
mtcnn = MTCNN(keep_all=True, device=device)

# Function to extract face embeddings


def extract_face_embeddings(image):

    faces = mtcnn(image)
    # print(f"Found {len(faces)} face(s) in the {image}.")
    if faces is not None and len(faces) > 0:
        embeddings = resnet(faces)
        return embeddings
    else:
        return None

# Function to calculate cosine similarity between embeddings


def cosine_similarity(embedding1, embedding2):
    embedding1_np = embedding1.detach().cpu().numpy()
    embedding2_np = embedding2.detach().cpu().numpy()
    dot_product = np.dot(embedding1_np, embedding2_np)
    norm1 = np.linalg.norm(embedding1_np)
    norm2 = np.linalg.norm(embedding2_np)
    similarity = dot_product / (norm1 * norm2)
    return float(similarity)

# Function to load and preprocess images from a directory


def upload_image_to_firebase_storage(image, folder_name, filename):
    bucket = storage.bucket()  # This should now work correctly
    blob = bucket.blob(f'{folder_name}/{filename}')
    blob.upload_from_string(image, content_type='image/jpeg')
    return blob.public_url


def load_images_from_firebase_storage(folder_name):
    bucket = storage.bucket()
    blobs = bucket.list_blobs(prefix=f'{folder_name}/')
    embeddings = []
    for blob in blobs:
        image_data = blob.download_as_string()
        np_img = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        embedding = extract_face_embeddings(image)
        if embedding is not None:
            embeddings.append((blob.name, embedding.mean(dim=0), image))
    return embeddings


@app.route('/upload_images', methods=['POST'])
def upload_images():
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400

    folder_name = request.form.get('folderName')
    if not folder_name:
        return jsonify({'error': 'No folderName provided'}), 400

    files = request.files.getlist('images')
    uploaded_count = 0

    for index, file in enumerate(files, start=1):
        if file and file.filename:
            np_img = np.frombuffer(file.read(), np.uint8)
            image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
            _, buffer = cv2.imencode('.jpg', image)
            img_string = buffer.tobytes()

            # Upload image to Firebase Storage
            filename = f"{index}.jpg"
            upload_image_to_firebase_storage(img_string, folder_name, filename)
            uploaded_count += 1

    return jsonify({'message': f'{uploaded_count} images uploaded successfully'}), 200




@bot.message_handler(commands=['start'])
def start_command(message):
    bot.send_message(message.chat.id, "Welcome! Please send me an image to find similar faces.")


@app.route('/find_similar_faces', methods=['POST'])
def find_similar_faces():
    data  = request.json

    # Check if 'image' is in the JSON payload
    if 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    folder_name = data.get('folderName')
    if not folder_name:
        return jsonify({'error': 'No folderName provided'}), 400

    try:
        # Extract the base64 image string
        img_data = data['image']
        
        # Remove the header if present (e.g., "data:image/jpeg;base64,")
        if "base64," in img_data:
            img_data = img_data.split("base64,")[1]

        # Decode the base64 image to bytes
        img_bytes = base64.b64decode(img_data)
        
        # Convert the bytes to a NumPy array
        nparr = np.frombuffer(img_bytes, np.uint8)
        
        # Decode the image using OpenCV
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Ensure the image was successfully decoded
        if img is None:
            return jsonify({'error': 'Decoded image is empty or invalid'}), 400

        # Convert the image from BGR to RGB (if needed)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Process the image for face detection here...
        # Your face embedding logic will go here...

    except Exception as e:
        # Return detailed error if there's an issue with decoding or processing the image
        return jsonify({'error': 'Invalid image data', 'details': str(e)}), 400

    # Extract face embeddings from the input image
    face_embeddings = extract_face_embeddings(img)
    if face_embeddings is None:
        return jsonify({'error': 'No face detected in the input image'}), 400

    # Load embeddings from Firebase Storage for the given folder
    stored_embeddings = load_images_from_firebase_storage(folder_name)

    similar_images = []
    for face_embedding in face_embeddings:
        for filename, stored_embedding, stored_image in stored_embeddings:
            similarity = cosine_similarity(face_embedding, stored_embedding)
            if similarity >= 0.6:  # Minimum similarity threshold
                # Convert image to base64 for JSON response
                _, buffer = cv2.imencode('.jpg', cv2.cvtColor(stored_image, cv2.COLOR_RGB2BGR))
                img_base64 = base64.b64encode(buffer).decode('utf-8')
                similar_images.append({
                    'filename': filename,
                    'similarity': float(similarity),
                    'image': img_base64
                })

    # Sort by similarity (descending)
    similar_images.sort(key=lambda x: x['similarity'], reverse=True)

    # Filter similar images with similarity >= 0.6
    filtered_similar_images = [img for img in similar_images if img['similarity'] >= 0.6]

    chat_id = data.get('telegramID')
    if chat_id:
        print(chat_id)
        for similar_image in filtered_similar_images:
            img_io = BytesIO(base64.b64decode(similar_image['image']))
            img_io.seek(0)
            # Send each image to the Telegram chat using the bot
            bot.send_photo("915394841", img_io, caption=f"Filename: {similar_image['filename']}, Similarity: {similar_image['similarity']:.2f}")

    return jsonify({'similar_images': filtered_similar_images}), 200


if __name__ == '__main__':                                              
    app.run(debug=True)
