# 🚀 Run Miami Junk Car Website Locally

## Quick Start Options

### Option 1: Easy Start (Recommended)
```bash
cd "/Users/isaac/Desktop/Junk cars site"
./start-server.sh
```

### Option 2: Python Server
```bash
cd "/Users/isaac/Desktop/Junk cars site"
python3 server.py
```

### Option 3: Simple Python Server
```bash
cd "/Users/isaac/Desktop/Junk cars site"
python3 -m http.server 8000
```

### Option 4: Node.js (if you have it installed)
```bash
cd "/Users/isaac/Desktop/Junk cars site"
npx http-server . -p 8000 -o
```

### Option 5: PHP (if you have it installed)
```bash
cd "/Users/isaac/Desktop/Junk cars site"
php -S localhost:8000
```

## 🔗 Testing URLs

Once the server is running, test these URLs:

### Main Pages
- **Homepage:** http://localhost:8000
- **Spanish Homepage:** http://localhost:8000/es/

### Service Pages
- **Flood Damaged Cars:** http://localhost:8000/services/flood-damaged-cars/
- **No Title Cars:** http://localhost:8000/services/no-title-cars/

### Location Pages  
- **Hialeah:** http://localhost:8000/locations/hialeah/

### Brand Pages
- **Honda:** http://localhost:8000/brands/honda/

### Content Marketing
- **Blog:** http://localhost:8000/blog/

### SEO Files
- **Sitemap:** http://localhost:8000/sitemap.xml
- **Robots:** http://localhost:8000/robots.txt

## 🧪 What to Test

### 1. Mobile Responsiveness
- Resize browser window to mobile size
- Test form functionality on mobile
- Check navigation menu on small screens

### 2. Quote Form Testing
- Fill out the multi-step quote form
- Test form validation
- Check progress indicators

### 3. Phone Number Links
- Click phone numbers - should open dialer
- Test "Call Now" buttons
- Verify WhatsApp links

### 4. Internal Navigation
- Test all navigation menu items
- Click internal links throughout pages
- Verify breadcrumb navigation

### 5. SEO Elements
- View page source to see Schema markup
- Check meta titles and descriptions
- Test hreflang switching (English/Spanish)

### 6. Performance Testing
- Check page load speeds
- Test on different devices
- Monitor console for errors

## 🎯 Key Features to Verify

### ✅ Lead Generation Elements
- [ ] Phone numbers prominently displayed
- [ ] Quote form working correctly
- [ ] CTAs are urgent and action-oriented
- [ ] Contact bar sticky at bottom

### ✅ SEO Optimization
- [ ] Clean URLs for all pages
- [ ] Proper heading structure (H1, H2, H3)
- [ ] Schema markup in page source
- [ ] Internal linking working

### ✅ Miami-Specific Content
- [ ] Local neighborhood mentions
- [ ] Hurricane/flood damage content
- [ ] Spanish language switching
- [ ] Florida legal compliance messaging

### ✅ Trust Signals
- [ ] License numbers displayed
- [ ] Customer testimonials visible
- [ ] Business address and hours
- [ ] Professional appearance

## 🐛 Common Issues & Solutions

### Port Already in Use
If port 8000 is busy:
```bash
# Kill process using port 8000
lsof -ti:8000 | xargs kill

# Or use a different port
python3 -m http.server 8001
```

### File Not Loading
- Check file paths are correct
- Ensure all files are in the right directories
- Clear browser cache (Cmd+Shift+R)

### Form Not Working
- Check browser console for JavaScript errors
- Ensure all CSS/JS files are loading
- Test form step-by-step

## 📱 Mobile Testing

Test the site on different screen sizes:
- Desktop (1200px+)
- Tablet (768px-1199px)  
- Mobile (320px-767px)

Use Chrome DevTools:
1. Right-click → Inspect
2. Click device icon (top-left)
3. Select different devices
4. Test responsiveness

## 🔍 SEO Testing Tools

While running locally, test with:
- View page source (Ctrl+U)
- Chrome DevTools Lighthouse
- Check meta tags and Schema
- Test internal link structure

## 📞 Contact Testing

Verify all contact methods work:
- Phone links open correct app
- WhatsApp links formatted correctly  
- Form submissions trigger properly
- Email links work as expected

## 🚀 Ready to Test!

Your website is now ready for comprehensive local testing. This will help you verify:
- All functionality works correctly
- Mobile experience is perfect
- Lead generation elements are optimized
- SEO implementation is complete

**Happy Testing! The site is optimized for maximum leads and Google dominance!** 📞💰