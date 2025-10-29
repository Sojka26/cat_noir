# 🐱 Laser Cat (HTML5 Pixel Game)

**Laser Cat** je jednoduchá 8-bitová arkádová hra napsaná v JavaScriptu a HTML5 canvasu. Hrajete za černou kočku, která pomocí laserů z očí bojuje proti robotickým psům. Hru lze ovládat klávesnicí i myší a obsahuje i štít aktivovaný hlazením!

---

## 🎮 Ovládání

| Klávesa / Akce | Funkce                         |
|----------------|--------------------------------|
| ↑ / ↓          | Pohyb nahoru / dolů            |
| **Space**      | Vystřelí lasery z očí           |
| **E** nebo kliknutí myší | Hladí kočku → aktivuje elektrický štít |
| **R**          | Restart hry po Game Over       |

---

## 🗂️ Obsah projektu

laser_cat/
├── index.html # Hlavní HTML stránka
├── game.js # Herní logika
├── style.css # Stylování canvasu
├── README.md # Tento soubor
└── assets/ # Složka s 8-bitovými sprity
├── cat.png # Černá kočka
├── dog.png # Robo-pes
├── hand.png # Ruka (pro hlazení)
├── nail.png # Hřebík (projektil psa)
└── bowl.png # Miska mléka

yaml
Zkopírovat kód

---

## 🧪 Jak spustit hru

1. Rozbalte archiv `laser_cat_final.zip`
2. Otevřete soubor `index.html` v libovolném moderním prohlížeči (Chrome, Firefox…)
3. Užijte si akci s laserovou kočkou!

> ⚠️ Hra je plně offline – žádné připojení k internetu není potřeba.

---

## 💡 Poznámky k vývoji

- Kreslí se přes `canvas`, obrázky jsou záměrně **pixelated** (bez vyhlazování)
- Vyhlazování je vypnuto pomocí:
  - `g.imageSmoothingEnabled = false` v JS
  - `image-rendering: pixelated;` v CSS

---

## 📄 Licence

Tento projekt je vytvořen pro účely učení a zábavy. Můžeš ho upravit, přetvořit nebo použít jako základ pro vlastní pixelartové hry.

---
