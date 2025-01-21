#!/bin/bash

# Zielverzeichnis
TARGET_DIR="src/assets/images/shop"

# Array mit Bildlinks und Zieldateien
declare -A images=(
  ["hair-wax.jpg"]="https://images.unsplash.com/photo-1621607512022-6aecc4c1b1ac"
  ["beard-oil.jpg"]="https://images.unsplash.com/photo-1621607512337-5a6618e6f2b9"
  ["shampoo.jpg"]="https://images.unsplash.com/photo-1620916566398-39f1143ab7be"
  ["beard-comb.jpg"]="https://images.unsplash.com/photo-1621607512905-341fc1d0c7c7"
  ["pomade.jpg"]="https://images.unsplash.com/photo-1621607512789-4b9d517d4b6b"
  ["conditioner.jpg"]="https://images.unsplash.com/photo-1620916566517-797d88295cc9"
)

# Erstelle Zielverzeichnis, falls es nicht existiert
mkdir -p "$TARGET_DIR"

# Lade die Bilder herunter
for filename in "${!images[@]}"; do
  curl -L "${images[$filename]}" -o "$TARGET_DIR/$filename"
  echo "Downloaded $filename"
done

echo "All images downloaded successfully!" 