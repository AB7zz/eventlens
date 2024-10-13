from flask import Flask
from flask_cors import CORS
import os
import cv2
import uuid
import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
import base64
import telebot
from io import BytesIO
from dotenv import load_dotenv
app = Flask(__name__)
CORS(app)

load_dotenv()
TELEGRAM_API = os.getenv('TELEGRAM_API')
bot = telebot.TeleBot(TELEGRAM_BOT_TOKEN)


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

def load_images_and_extract_embeddings(directory):
    embeddings = []
    for filename in os.listdir(directory):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            filepath = os.path.join(directory, filename)
            image = cv2.imread(filepath)
            if image is not None:
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                embedding = extract_face_embeddings(image)
                if embedding is not None:
                    embeddings.append((filename, embedding.mean(dim=0), image))
    return embeddings

stored_embeddings = load_images_and_extract_embeddings('faces')

@bot.message_handler(commands=['start'])
def start_command(message):
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True)
    markup.add("Upload Images", "Get Similar Images")
    bot.send_message(message.chat.id, "Please choose an option:", reply_markup=markup)

@bot.message_handler(func=lambda message: True)
def handle_choice(message):
    if message.text == "Upload Images":
        bot.send_message(message.chat.id, "Please send me the images you want to upload.")
        bot.register_next_step_handler(message, upload_images_handler)
    elif message.text == "Get Similar Images":
        bot.send_message(message.chat.id, "Please send me the image to compare.")
        bot.register_next_step_handler(message, find_similar_faces_handler)
    else:
        start_command(message)

def upload_images_handler(message):
    folder_name = os.path.join('faces', 'photos')
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)

    if not message.photo:
        bot.send_message(message.chat.id, "No images detected. Please try again.")
        return start_command(message)

    uploaded_count = 0
    highest_res_photo = message.photo[-1]
    file_info = bot.get_file(highest_res_photo.file_id)
    downloaded_file = bot.download_file(file_info.file_path)

    random_filename = f"{uuid.uuid4()}.jpg"
    new_filename = os.path.join(folder_name, random_filename)

    while os.path.exists(new_filename):
        random_filename = f"{uuid.uuid4()}.jpg"
        new_filename = os.path.join(folder_name, random_filename)

    with open(new_filename, 'wb') as new_file:
        new_file.write(downloaded_file)
        uploaded_count += 1

    bot.send_message(message.chat.id, f"{uploaded_count} images uploaded successfully.")
    start_command(message)

def find_similar_faces_handler(message):
    folder_name = 'photos'
    file_info = bot.get_file(message.photo[-1].file_id)
    downloaded_file = bot.download_file(file_info.file_path)

    nparr = np.frombuffer(downloaded_file, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    face_embeddings = extract_face_embeddings(img)
    if face_embeddings is None:
        bot.reply_to(message, "No face detected in the image.")
        return start_command(message)

    stored_embeddings = load_images_and_extract_embeddings(os.path.join('faces', folder_name))
    
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
    
    start_command(message)

if __name__ == '__main__':
    bot.polling()
