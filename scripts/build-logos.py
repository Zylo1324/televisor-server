#!/usr/bin/env python3
"""Build TV friendly, same origin PNG logos for every catalog channel."""

import io
import json
import re
import subprocess
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "logos"
RAW = "https://raw.githubusercontent.com/tv-logo/tv-logos/main/"

SOURCES = {
    2: "https://assets.rudo.video/assets/latina/live/logoApi_41f7da8c23667b5df6d91c67782924e81757541245.png",
    3: "https://i.imgur.com/Zt3iE86.png",
    4: "https://i.imgur.com/vr0g3u1.png",
    5: "https://i.imgur.com/uQhEDES.png",
    6: "https://i.imgur.com/pu0BSB7.png",
    7: "https://i.imgur.com/6io0IrX.png",
    8: "https://i.imgur.com/Y9k9XSO.png",
    9: "https://i.imgur.com/eUzYZfg.png",
    10: "https://i.imgur.com/fY9256H.png",
    11: "https://i.imgur.com/m44jTZK.png",
    12: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/TV_Per%C3%BA_Noticias_-_2019_logo.png/960px-TV_Per%C3%BA_Noticias_-_2019_logo.png",
    13: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Global_logo_2019.png",
    14: "https://i.imgur.com/oBz3CgE.png",
    15: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/LaTele_Per%C3%BA_2018_Logo.png/960px-LaTele_Per%C3%BA_2018_Logo.png",
    16: "https://i.imgur.com/bZnDDPH.png",
    17: "https://i.imgur.com/LnyVa5H.png",
    18: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Logo_Canal_IPe_2024.png/960px-Logo_Canal_IPe_2024.png",
    19: "https://i.imgur.com/VOjLXJd.png",
    21: "https://i.imgur.com/zCVh765.png",
    33: "https://i.imgur.com/9cmIv3q.png",
    40: "https://next-liga1.fanatiz.com/liga1/strapi/production/small_image_LIGA_1_MAX_fabe3155b8.png",
    41: "https://next-liga1.fanatiz.com/liga1/strapi/production/small_image_LIGA_1_MAX_fabe3155b8.png",
    42: RAW + "countries/world-latin-america/espn-lam.png",
    43: RAW + "countries/world-latin-america/espn-2-lam.png",
    44: RAW + "countries/world-latin-america/espn-3-lam.png",
    45: RAW + "countries/world-latin-america/fox-sports-1-lam.png",
    46: RAW + "countries/world-latin-america/fox-sports-2-lam.png",
    47: RAW + "countries/world-latin-america/fox-sports-3-lam.png",
    48: RAW + "countries/world-latin-america/fox-sports-premium-lam.png",
    49: RAW + "countries/world-latin-america/espn-premium-lam.png",
    50: RAW + "countries/world-latin-america/claro-sports-lam.png",
    51: RAW + "countries/world-latin-america/dsports-lam.png",
    52: RAW + "countries/world-latin-america/dsports2-lam.png",
    53: RAW + "countries/world-latin-america/dsports-plus-lam.png",
    54: RAW + "countries/argentina/tyc-sports-ar.png",
    55: RAW + "countries/world-latin-america/tnt-sports-premium-lam.png",
    56: RAW + "countries/world-latin-america/tnt-sports-lam.png",
    57: "https://i.imgur.com/DuSSrHV.png",
    58: "https://i.imgur.com/DuSSrHV.png",
    59: "https://i.imgur.com/6wkmgGM.png",
    60: RAW + "countries/world-latin-america/fox-sports-1-lam.png",
    61: RAW + "countries/world-latin-america/fox-sports-2-lam.png",
    62: RAW + "countries/world-latin-america/fox-sports-3-lam.png",
    65: RAW + "countries/united-states/paramount-network-us.png",
    70: RAW + "countries/world-latin-america/hbo-2-lam.png",
    71: RAW + "countries/world-latin-america/hbo-family-lam.png",
    72: RAW + "countries/world-latin-america/hbo-plus-lam.png",
    73: RAW + "countries/world-latin-america/hbo-signature-lam.png",
    74: RAW + "countries/world-latin-america/hbo-xtreme-lam.png",
    75: RAW + "countries/argentina/tnt-ar.png",
    76: RAW + "countries/world-latin-america/tnt-series-lam.png",
    77: RAW + "countries/world-latin-america/tnt-novelas-lam.png",
    78: RAW + "countries/world-latin-america/space-lam.png",
    79: RAW + "countries/argentina/axn-ar.png",
    80: RAW + "countries/world-latin-america/fx-lam.png",
    81: RAW + "countries/world-latin-america/sony-channel-lam.png",
    82: RAW + "countries/world-latin-america/star-lam.png",
    83: RAW + "countries/world-latin-america/warner-channel-lam.png",
    84: RAW + "countries/world-latin-america/cinemax-lam.png",
    85: RAW + "countries/world-latin-america/golden-lam.png",
    86: RAW + "countries/world-latin-america/golden-premier-lam.png",
    87: RAW + "countries/world-latin-america/cine-canal-lam.png",
    88: RAW + "countries/world-latin-america/studio-universal-lam.png",
    89: RAW + "countries/argentina/comedy-central-ar.png",
    90: RAW + "countries/world-latin-america/film-and-arts-lam.png",
    91: RAW + "countries/argentina/cartoon-network-ar.png",
    92: RAW + "countries/world-latin-america/cartoonito-lam.png",
    93: RAW + "countries/world-latin-america/nickelodeon-lam.png",
    94: RAW + "countries/world-latin-america/discovery-kids-lam.png",
    95: RAW + "countries/world-latin-america/disney-jr-lam.png",
    100: RAW + "countries/world-latin-america/discovery-home-and-health-lam.png",
    101: RAW + "countries/world-latin-america/el-gourmet-lam.png",
    102: RAW + "countries/world-latin-america/history-channel-lam.png",
    103: RAW + "countries/world-latin-america/history-channel-2-lam.png",
    104: RAW + "countries/world-latin-america/national-geographic-lam.png",
    105: RAW + "countries/united-states/discovery-turbo-us.png",
    110: RAW + "countries/world-latin-america/cnn-en-espanol-lam.png",
    111: RAW + "countries/united-states/us-local/telemundo/telemundo-puerto-rico-wkaq-tv-us-pr.png",
    112: RAW + "countries/mexico/las-estrellas-mx.png",
    113: RAW + "countries/united-states/us-local/univision/univision-us.png",
}

GROUP_COLORS = {
    "Deportes": (6, 112, 67),
    "Infantil": (128, 50, 160),
    "Noticias": (168, 28, 42),
    "Cultura": (17, 94, 130),
    "Entretenimiento": (52, 60, 118),
    "Series y Peliculas": (96, 35, 107),
    "Nacionales (Chiclayo)": (17, 80, 145),
}


def channel_catalog():
    command = [
        "node", "--input-type=module", "-e",
        "import {CHANNELS} from './api/_core.js'; console.log(JSON.stringify(CHANNELS))",
    ]
    return json.loads(subprocess.check_output(command, cwd=ROOT, text=True))


def fonts():
    bold_paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/SFNS.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    regular_paths = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    bold = next((p for p in bold_paths if Path(p).exists()), None)
    regular = next((p for p in regular_paths if Path(p).exists()), bold)
    return (
        ImageFont.truetype(bold, 44) if bold else ImageFont.load_default(),
        ImageFont.truetype(regular, 21) if regular else ImageFont.load_default(),
    )


def clean_name(name):
    return re.sub(r"\s*\([^)]*\)", "", name).strip()


def initials(name):
    words = re.findall(r"[A-Za-zÀ-ÿ0-9]+", clean_name(name))
    if not words:
        return "TV"
    if len(words) == 1:
        return words[0][:4].upper()
    return "".join(word[0] for word in words[:4]).upper()


def fetch_logo(url):
    response = requests.get(url, timeout=15, headers={"User-Agent": "televisor-server-logo-builder/1.0"})
    response.raise_for_status()
    if not response.headers.get("content-type", "").startswith("image/"):
        raise ValueError("upstream did not return an image")
    image = Image.open(io.BytesIO(response.content))
    image.load()
    return image.convert("RGBA")


def fit_text(draw, value, max_width, font_path, starting_size):
    for size in range(starting_size, 13, -1):
        font = ImageFont.truetype(font_path, size) if font_path else ImageFont.load_default()
        if draw.textbbox((0, 0), value, font=font)[2] <= max_width:
            return font
    return ImageFont.load_default()


def render(channel, logo, bold_font, regular_font):
    width, height = 512, 288
    color = GROUP_COLORS.get(channel["group"], (31, 47, 78))
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((8, 8, width - 8, height - 8), radius=36, fill=(*color, 255))
    draw.rounded_rectangle((16, 16, width - 16, height - 16), radius=30, outline=(255, 255, 255, 38), width=2)

    if logo is not None:
        logo.thumbnail((390, 182), Image.Resampling.LANCZOS)
        x = (width - logo.width) // 2
        y = (218 - logo.height) // 2 + 2
        canvas.alpha_composite(logo, (x, y))
    else:
        value = initials(channel["name"])
        box = draw.textbbox((0, 0), value, font=bold_font)
        draw.text(((width - (box[2] - box[0])) / 2, 78), value, font=bold_font, fill="white")

    label = clean_name(channel["name"])
    font_path = getattr(regular_font, "path", None)
    label_font = fit_text(draw, label, 450, font_path, 22)
    box = draw.textbbox((0, 0), label, font=label_font)
    draw.rounded_rectangle((24, 232, width - 24, 270), radius=18, fill=(0, 0, 0, 105))
    draw.text(((width - (box[2] - box[0])) / 2, 239), label, font=label_font, fill="white")
    return canvas


def main():
    OUTPUT.mkdir(exist_ok=True)
    bold_font, regular_font = fonts()
    official = 0
    generated = 0
    for channel in channel_catalog():
        logo = None
        source = SOURCES.get(channel["chno"])
        if source:
            try:
                logo = fetch_logo(source)
                official += 1
            except Exception as err:
                print(f"fallback {channel['chno']}: {err}")
        if logo is None:
            generated += 1
        render(channel, logo, bold_font, regular_font).save(
            OUTPUT / f"{channel['chno']}.png", "PNG", optimize=True
        )
    print(f"created {official + generated} logos ({official} official, {generated} branded fallbacks)")


if __name__ == "__main__":
    main()
