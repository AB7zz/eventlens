import os
import cv2
import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
import telebot
from io import BytesIO
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, storage
import base64

load_dotenv()
TELEGRAM_API = os.getenv('TELEGRAM_API')

bot = telebot.TeleBot(TELEGRAM_API)

# Initialize Firebase
cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), 'creds.json'))
firebase_admin.initialize_app(cred, {
    'storageBucket': os.getenv('VITE_FIREBASE_STORAGE_BUCKET')
})

device = 'cuda' if torch.cuda.is_available() else 'cpu'
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
mtcnn = MTCNN(keep_all=True, device=device)

def extract_face_embeddings(image):
    faces = mtcnn(image)
    if faces is not None and len(faces) > 0:
        embeddings = resnet(faces)
        return embeddings
    else:
        return None

def cosine_similarity(embedding1, embedding2):
    embedding1_np = embedding1.detach().cpu().numpy()
    embedding2_np = embedding2.detach().cpu().numpy()
    dot_product = np.dot(embedding1_np, embedding2_np)
    norm1 = np.linalg.norm(embedding1_np)
    norm2 = np.linalg.norm(embedding2_np)
    similarity = dot_product / (norm1 * norm2)
    return float(similarity)

def upload_image_to_firebase_storage(image, folder_name, filename):
    bucket = storage.bucket()
    blob = bucket.blob(f'{folder_name}/{filename}')
    blob.upload_from_string(image, content_type='image/jpeg')
    return blob.public_url

def load_images_from_firebase_storage(folder_name):
    bucket = storage.bucket()
    blobs = bucket.list_blobs(prefix=f'{folder_name}/')
    embeddings = []
    for blob in blobs:
        image_data = blob.download_as_bytes()
        np_img = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        embedding = extract_face_embeddings(image)
        if embedding is not None:
            embeddings.append((blob.name, embedding.mean(dim=0), image))
    return embeddings

@bot.message_handler(commands=['start'])
def start_command(message):
    bot.send_message(message.chat.id, "Welcome! Please send me an image to find similar faces.")

@bot.message_handler(content_types=['photo'])
def find_similar_faces_handler(message):
    folder_name = 'telegram_photos'
    file_info = bot.get_file(message.photo[-1].file_id)
    downloaded_file = bot.download_file(file_info.file_path)

    nparr = np.frombuffer(downloaded_file, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    face_embeddings = extract_face_embeddings(img)
    if face_embeddings is None:
        bot.reply_to(message, "No face detected in the image. Please try another image.")
        return

    stored_embeddings = load_images_from_firebase_storage(folder_name)

    similar_images = []
    for face_embedding in face_embeddings:
        for filename, stored_embedding, stored_image in stored_embeddings:
            similarity = cosine_similarity(face_embedding, stored_embedding)
            if similarity >= 0.6:
                similar_images.append((filename, stored_image, similarity))

    similar_images.sort(key=lambda x: x[2], reverse=True)

    if similar_images:
        bot.reply_to(message, f"Found {len(similar_images)} similar images:")
        for filename, stored_image, similarity in similar_images:
            img_io = BytesIO()
            img_to_send = cv2.cvtColor(stored_image, cv2.COLOR_RGB2BGR)
            _, buffer = cv2.imencode('.jpg', img_to_send)
            img_io.write(buffer)
            img_io.seek(0)

            bot.send_photo(message.chat.id, img_io, caption=f"Similarity: {similarity:.2f}")
    else:
        bot.reply_to(message, "No similar faces found.")

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    bot.reply_to(message, "Please send an image to find similar faces.")

if __name__ == '__main__':
    bot.polling()