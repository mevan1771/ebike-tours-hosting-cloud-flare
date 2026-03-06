# Porting Guide: tour-ancient-cities.html to Another Website

## Step-by-Step Instructions

### 1. **Copy Required Files**

#### A. HTML File
- Copy `tour-ancient-cities.html` to your new website

#### B. JavaScript File
- Copy `assets/js/main.js` to your new website (keep same folder structure: `assets/js/main.js`)

#### C. All Images (Critical!)
You need to copy ALL these image folders/files:

```
assets/
├── Images/
│   ├── day-tours/
│   │   └── dambulla/
│   │       ├── Dambulla-Caves.jpg
│   │       ├── edited.jpg
│   │       ├── entrance-to-somaathi.jpg
│   │       ├── ibbankatuwa temple.jpg
│   │       ├── ibbankatuwa temple 2.jpg
│   │       ├── love island.jpg
│   │       └── love island 2.jpg
│   ├── ebikes/
│   │   ├── ebike 2D.jpeg
│   │   ├── helmet.png
│   │   ├── charger.jpg
│   │   ├── tools.jpg
│   │   ├── pump.jpg
│   │   ├── bag.png
│   │   └── battery.jpg
│   ├── Gemini_Generated_Image_28jtol28jtol28jt.png
│   ├── Gemini_Generated_Image_9qok3r9qok3r9qok.png
│   ├── boat ride.jpg
│   ├── lepord.jpg
│   └── Coconuts-in-Vietnam-539039-500px.jpg
```

### 2. **Update File Paths in HTML**

After copying files, you have two options:

#### Option A: Keep Same Folder Structure
If you keep `assets/` folder structure, no changes needed!

#### Option B: Different Folder Structure
If your images are in a different location, use Find & Replace:

**Find:** `assets/Images/`
**Replace:** `your-new-path/images/` (or whatever your path is)

### 3. **Update Navigation Links**

The page has links to other pages. Update these if needed:

**Find & Replace:**
- `index.html` → Your homepage URL
- `tours.html` → Your tours page URL
- `about.html` → Your about page URL
- `gallery.html` → Your gallery page URL
- `faq.html` → Your FAQ page URL
- `contact.html` → Your contact page URL
- `book.html` → Your booking page URL

### 4. **External Dependencies (Already in HTML - No Action Needed)**

These are loaded from CDN, so they work automatically:
- ✅ Tailwind CSS (line 16)
- ✅ Google Fonts - Inter (line 13)
- ✅ Koalendar booking widget (lines 317-320)
- ✅ GPX Studio map (line 333)

### 5. **Test Checklist**

After copying, test these features:

- [ ] Page loads without errors
- [ ] All images display correctly
- [ ] Navigation menu works (mobile & desktop)
- [ ] Tabs work (Itinerary, What's included, etc.)
- [ ] Accordion items expand/collapse
- [ ] Booking widget (Koalendar) loads
- [ ] Route map iframe loads
- [ ] Google Maps iframe loads
- [ ] Footer links work
- [ ] Mobile menu opens/closes

### 6. **Quick Path Update Script**

If you need to change all image paths at once, use this find/replace:

**Find:** `src="assets/`
**Replace:** `src="your-new-path/assets/`

**Find:** `url('assets/`
**Replace:** `url('your-new-path/assets/`

---

## Alternative: Standalone Version

If you want a completely standalone file (no external JS file needed), see `tour-ancient-cities-standalone.html` which includes everything inline.

