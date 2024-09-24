import cv2
import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
import os
import matplotlib.pyplot as plt

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
                    embeddings.append((filename, embedding.mean(dim=0), image))  # Use average embedding for single image
    return embeddings

# Load and preprocess embeddings of stored faces
stored_embeddings = load_images_and_extract_embeddings(r'C:\Users\acer\Desktop\eventlens\packages\backend\faces')

# Function to plot a grid of similar images for group photos
def plot_similar_images(input_image_path, stored_embeddings, similarity_threshold=None, top_n=None):
    input_image = cv2.imread(input_image_path)
    input_image = cv2.cvtColor(input_image, cv2.COLOR_BGR2RGB)
    face_embeddings = extract_face_embeddings(input_image)
    
    if face_embeddings is not None:
        all_similarities = []
        
        for face_embedding in face_embeddings:
            similarities = []
            for filename, stored_embedding, stored_image in stored_embeddings:
                similarity = cosine_similarity(face_embedding, stored_embedding)
                similarities.append((filename, similarity, stored_image))
                print(f"Face embedding similarity with {filename}: {similarity:.4f}")
            
            # Sort by similarity (descending)
            similarities.sort(key=lambda x: x[1], reverse=True)
            
            # Filter by threshold or select top N results
            if similarity_threshold is not None:
                filtered_similarities = [x for x in similarities if x[1] >= similarity_threshold]
            elif top_n is not None:
                filtered_similarities = similarities[:top_n]
            else:
                filtered_similarities = similarities
            
            # Aggregate results, allowing for overlap
            all_similarities.extend(filtered_similarities)
        
        # Deduplicate results by filename
        unique_similarities = {}
        for filename, similarity, img in all_similarities:
            if filename not in unique_similarities:
                unique_similarities[filename] = (similarity, img)
        
        # Plot the most accurate photos in a grid
        num_images = len(unique_similarities)
        grid_size = int(np.ceil(np.sqrt(num_images)))  # Determine grid size
        plt.figure(figsize=(10, 10))
        
        for idx, (filename, (similarity, img)) in enumerate(unique_similarities.items()):
            plt.subplot(grid_size, grid_size, idx + 1)
            plt.imshow(img)
            plt.title(f"{filename}\nSimilarity: {similarity:.4f}")
            plt.axis('off')
        
        plt.show()

# Example usage: provide the path to your input image
input_image_path = r"C:\Users\acer\Downloads\20240813_104925.jpg"
# Use a similarity threshold or return top N results
plot_similar_images(input_image_path, stored_embeddings, similarity_threshold=0.5)  # Example threshold
# plot_similar_images(input_image_path, stored_embeddings, top_n=5)  # Example top N
