# 🌙 Dark Mode Guide

## ✅ What's New

TaskPilot now supports **Dark Mode** with:
- ✅ Toggle button in navbar (☀️/🌙)
- ✅ Persistent preference (localStorage)
- ✅ System preference detection
- ✅ Beautiful slate theme
- ✅ Smooth transitions

## 🎯 How to Use Dark Mode

### Enable Dark Mode
1. Click the **🌙 Moon** icon in the top navbar
2. The app switches to dark mode instantly
3. Your preference is saved automatically

### Disable Dark Mode
1. Click the **☀️ Sun** icon in the navbar
2. The app switches back to light mode
3. Your preference is updated

### System Preference
- If you haven't set a preference, TaskPilot detects your OS theme preference
- On first visit:
  - If your system is set to dark mode → Dark mode enabled
  - If your system is set to light mode → Light mode enabled

## 🎨 Design Details

### Colors Used
- **Light Mode**: Clean whites and blues (original design)
- **Dark Mode**: 
  - Background: `slate-900` to `slate-950` (very dark)
  - Cards: `slate-800` (dark)
  - Text: `white` and `gray-300` (light text)
  - Accents: Brighter blues for visibility

### What's Styled
- ✅ All pages (Dashboard, Project, Archive, Login, Register)
- ✅ All components (Navbar, ProjectCard)
- ✅ Forms and inputs
- ✅ Buttons and interactive elements
- ✅ Navigation links
- ✅ Error messages
- ✅ Background gradients

### Transitions
Smooth 200ms transitions when switching themes for pleasant UX.

## 💾 Data Persistence

Your theme preference is saved in **localStorage** with key `theme`:
```javascript
localStorage.getItem('theme')  // Returns 'dark' or 'light'
```

**Location**: Browser's local storage
**Persistence**: Across browser sessions
**Scope**: Per browser/device

## 🔧 Technical Implementation

### Files Modified

1. **frontend/src/context/ThemeContext.tsx** (NEW)
   - React Context for theme state management
   - `useTheme()` hook for accessing theme
   - localStorage integration
   - System preference detection

2. **frontend/src/App.tsx**
   - Added ThemeProvider wrapper
   - Wraps entire app for global theme access

3. **frontend/src/components/Navbar.tsx**
   - Added dark mode toggle button
   - Updated all elements with `dark:` classes

4. **All Pages** (Dashboard, Project, Archive, Login, Register)
   - Updated backgrounds with `dark:from-slate-950`
   - Updated text colors with `dark:text-white`
   - Updated form inputs with `dark:bg-slate-700`

5. **All Components** (ProjectCard)
   - Added dark mode styling to cards
   - Updated button colors for dark mode

### Tailwind Classes Used
```css
/* Background */
dark:from-slate-950
dark:to-slate-900
dark:bg-slate-800
dark:bg-slate-700

/* Text */
dark:text-white
dark:text-gray-400
dark:text-gray-300

/* Borders */
dark:border-slate-700
dark:border-slate-600

/* Interactive */
dark:hover:bg-slate-700
dark:hover:text-blue-300
```

## 🚀 Features

### Automatic Detection
```typescript
// On first load, detect system preference
window.matchMedia('(prefers-color-scheme: dark)').matches
```

### Manual Toggle
```typescript
// Click moon icon to toggle
<button onClick={toggleDarkMode}>
  {isDark ? '☀️' : '🌙'}
</button>
```

### Persist Preference
```typescript
// Save to localStorage
localStorage.setItem('theme', isDark ? 'dark' : 'light');

// Apply to DOM
document.documentElement.classList.add('dark');
```

## 🔄 How It Works

1. **Initial Load**
   - Check localStorage for saved preference
   - If none found, check system preference
   - Set initial state and apply classes

2. **Toggle**
   - User clicks moon/sun icon
   - State updates
   - DOM updates with `dark` class
   - localStorage updates

3. **Persistence**
   - On next visit, localStorage is read
   - Same theme is applied
   - No flashing or theme change

## 🎓 Usage Example

```tsx
import { useTheme } from './context/ThemeContext';

const MyComponent = () => {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <button onClick={toggleDarkMode}>
      {isDark ? 'Light' : 'Dark'} Mode
    </button>
  );
};
```

## 📱 Responsive

Dark mode works on all devices:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile phones

Theme toggle button is in navbar on all screen sizes.

## 🌐 Browser Support

Works in all modern browsers:
- ✅ Chrome 76+
- ✅ Firefox 67+
- ✅ Safari 12.1+
- ✅ Edge 79+

## 🔮 Future Enhancements

- [ ] Auto dark mode based on time of day
- [ ] Multiple theme options (not just light/dark)
- [ ] Custom color schemes
- [ ] Accessibility improvements (high contrast mode)

## ✅ Checklist

- [x] Dark mode UI implemented
- [x] Theme toggle in navbar
- [x] LocalStorage persistence
- [x] System preference detection
- [x] All pages styled
- [x] All components styled
- [x] Smooth transitions
- [x] Mobile responsive
- [x] Production ready

---

**Status**: ✅ Complete & Live
**Availability**: All pages
**Persistence**: Yes (localStorage)
**Responsive**: Yes (all devices)

Enjoy dark mode! 🌙
