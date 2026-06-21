from PIL import Image, ImageDraw, ImageFont
import os

ICONS_DIR = os.path.join("frontend", "public", "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

def create_icon(size, filename):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Orange gradient background (rounded rect)
    r = int(size * 0.18)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill="#f97316")
    
    # Inner gradient effect
    for i in range(size // 3):
        alpha = int(20 * (1 - i / (size // 3)))
        draw.rounded_rectangle(
            [i, i, size - 1 - i, size - 1 - i],
            radius=max(r - i, 0),
            outline=(234, 88, 12, alpha),
        )
    
    # Plate circle (outer)
    cx, cy = size // 2, int(size * 0.44)
    plate_r = int(size * 0.24)
    draw.ellipse(
        [cx - plate_r, cy - plate_r, cx + plate_r, cy + plate_r],
        outline=(255, 255, 255, 220),
        width=max(size // 50, 2),
    )
    
    # Plate circle (inner)
    inner_r = int(size * 0.18)
    draw.ellipse(
        [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
        outline=(255, 255, 255, 100),
        width=max(size // 80, 1),
    )
    
    # "Cal" text
    try:
        font_size = int(size * 0.16)
        font = ImageFont.truetype("arial.ttf", font_size)
    except (OSError, IOError):
        font = ImageFont.load_default()
    
    draw.text((cx, cy), "Cal", fill="white", font=font, anchor="mm")
    
    # "CHECK" text
    try:
        font_sm = ImageFont.truetype("arialbd.ttf", int(size * 0.09))
    except (OSError, IOError):
        font_sm = font
    
    draw.text((cx, int(size * 0.76)), "CHECK", fill="white", font=font_sm, anchor="mm")
    
    # Small flame shape at bottom
    fy = int(size * 0.88)
    flame_h = int(size * 0.06)
    flame_w = int(size * 0.04)
    draw.ellipse(
        [cx - flame_w, fy - flame_h, cx + flame_w, fy + flame_h // 2],
        fill="#fbbf24",
    )
    # Flame tip
    draw.polygon(
        [(cx, fy - flame_h - int(size * 0.02)), (cx - flame_w // 2, fy - flame_h // 2), (cx + flame_w // 2, fy - flame_h // 2)],
        fill="#fbbf24",
    )
    
    path = os.path.join(ICONS_DIR, filename)
    img.save(path, "PNG")
    print(f"Created {path} ({size}x{size})")

# Generate all needed sizes
create_icon(192, "icon-192.png")
create_icon(512, "icon-512.png")
create_icon(180, "apple-touch-icon.png")
create_icon(152, "icon-152.png")
create_icon(167, "icon-167.png")

print("All icons created!")
