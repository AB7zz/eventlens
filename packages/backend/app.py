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
import base64

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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


@app.route('/find_similar_faces', methods=['POST'])
def find_similar_faces():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    folder_name = request.form.get('folderName')
    if not folder_name:
        return jsonify({'error': 'No folderName provided'}), 400

    input_image = request.files['image'].read()
    nparr = np.frombuffer(input_image, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    face_embeddings = extract_face_embeddings(img)
    if face_embeddings is None:
        return jsonify({'error': 'No face detected in the input image'}), 400

    stored_embeddings = load_images_from_firebase_storage(folder_name)

    similar_images = []
    for face_embedding in face_embeddings:
        for filename, stored_embedding, stored_image in stored_embeddings:
            similarity = cosine_similarity(face_embedding, stored_embedding)
            if similarity >= 0.6:  # Increased minimum similarity threshold to 0.6
                # Convert image to base64 for JSON response
                _, buffer = cv2.imencode('.jpg', cv2.cvtColor(
                    stored_image, cv2.COLOR_RGB2BGR))
                img_base64 = base64.b64encode(buffer).decode('utf-8')
                similar_images.append({
                    'filename': filename,
                    'similarity': float(similarity),
                    'image': img_base64
                })

    # Sort by similarity (descending)
    similar_images.sort(key=lambda x: x['similarity'], reverse=True)

    # Filter similar images with similarity >= 0.6
    filtered_similar_images = [
        img for img in similar_images if img['similarity'] >= 0.6]

    return jsonify({'similar_images': filtered_similar_images}), 200


if __name__ == '__main__':
    app.run(debug=True)
