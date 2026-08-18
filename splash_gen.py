from PIL import Image
from pathlib import Path

# Load source logo
logo = Image.open("assets/images/logo.png").convert("RGBA")
logo_w, logo_h = logo.size

# Create a 1024x1024 canvas with the splash background color
bg_color = (21, 26, 44, 255)  # #151A2C
splash = Image.new("RGBA", (1024, 1024), bg_color)

# Scale logo to fit within 600x600 max, preserving aspect ratio
max_w, max_h = 600, 600
scale = min(max_w / logo_w, max_h / logo_h, 1.0)
new_w = int(logo_w * scale)
new_h = int(logo_h * scale)
logo_resized = logo.resize((new_w, new_h), Image.LANCZOS)

# Center the logo on the canvas
x = (splash.width - new_w) // 2
y = (splash.height - new_h) // 2
splash.paste(logo_resized, (x, y), logo_resized)

# Save
output_path = Path("assets/images/splash-icon-ios.png")
splash.save(output_path, "PNG")
print(f"Created {output_path}: {splash.size}")
