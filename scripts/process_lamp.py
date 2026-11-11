import numpy as np
from PIL import Image, ImageFilter
from collections import deque
import os

source_path = r"C:/Users/hp/.gemini/antigravity/brain/2c5bf19e-49d8-4801-8d8e-e99f99fb71c4/.user_uploaded/media_1794370547264_8f14a3ec.jpg"

img = Image.open(source_path).convert("RGB")
w, h = img.size
arr = np.array(img, dtype=np.int32)

r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

# Compute color difference (saturation/chroma) and brightness
max_diff = np.maximum(np.maximum(np.abs(r - g), np.abs(r - b)), np.abs(g - b))
min_channel = np.minimum(np.minimum(r, g), b)

# Background checkerboard squares are light gray / off-white neutral tones:
# square 1: ~254, 254, 254
# square 2: ~231, 231, 231
# max_diff is tiny (<= 15), min_channel is high (>= 170)
is_neutral_light = (max_diff <= 15) & (min_channel >= 165)

# BFS flood fill from all borders to mark background
visited = np.zeros((h, w), dtype=bool)
q = deque()

for x in range(w):
    if is_neutral_light[0, x]:
        q.append((0, x))
        visited[0, x] = True
    if is_neutral_light[h - 1, x]:
        q.append((h - 1, x))
        visited[h - 1, x] = True

for y in range(h):
    if is_neutral_light[y, 0] and not visited[y, 0]:
        q.append((y, 0))
        visited[y, 0] = True
    if is_neutral_light[y, w - 1] and not visited[y, w - 1]:
        q.append((y, w - 1))
        visited[y, w - 1] = True

while q:
    y, x = q.popleft()
    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w:
            if not visited[ny, nx] and is_neutral_light[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))

# visited == True is background.
# Foreground lamp alpha
alpha = np.where(visited, 0, 255).astype(np.uint8)

# Check foreground bounding box
fg_y, fg_x = np.where(alpha > 0)
print(f"Foreground bbox: Y: {fg_y.min()} to {fg_y.max()}, X: {fg_x.min()} to {fg_x.max()}")
print(f"Foreground area: {len(fg_y)} / {w*h} ({len(fg_y)/(w*h)*100:.2f}%)")

# Slight feathering to avoid jagged anti-aliasing artifacts on borders
alpha_img = Image.fromarray(alpha, mode="L")
# Apply a tiny blur to smooth the 1px edge
alpha_smooth = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.75))

rgba = Image.fromarray(arr.astype(np.uint8), mode="RGB")
rgba.putalpha(alpha_smooth)

# Save to the targets
targets = [
    r"c:\Users\hp\OneDrive\KAYA-main\Frontend\public\images\masterpiece\cutouts\product_lamp_cutout.png",
    r"c:\Users\hp\OneDrive\KAYA-main\Frontend\public\images\masterpiece\cutouts\artisan_table_lamp_studio_cutout.png",
    r"c:\Users\hp\OneDrive\KAYA-main\Frontend\public\images\masterpiece\product_lamp.png"
]

for t in targets:
    os.makedirs(os.path.dirname(t), exist_ok=True)
    rgba.save(t, "PNG")
    print(f"Saved to {t} (size: {os.path.getsize(t)} bytes)")

print("Processing completed successfully.")

