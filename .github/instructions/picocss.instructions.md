# Pico CSS Instructions for LLMs

## Overview
Pico CSS is a minimalist, semantic-first CSS framework that prioritizes native HTML elements and responsive design. It provides elegant styling with minimal configuration.

## Core Philosophy
- **Semantic HTML First**: Style native HTML elements without requiring extensive classes
- **Responsive by Default**: All elements are mobile-first and responsive
- **Lightweight**: Minimal overhead with maximum impact
- **Class-less Option**: Can work entirely without CSS classes

## Installation & Setup

### CDN (Recommended for this project)
```html
<!-- Standard version -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">

<!-- Class-less version (current project uses this approach) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.jade.min.css">
```

### Essential Meta Tags
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
```

## Layout System

### Container
- **Class**: `.container`
- **Usage**: Main content wrapper with responsive margins
- **Example**: `<main class="container">Content</main>`

### Grid System
- **Class**: `.grid`
- **Behavior**: Auto-responsive columns that stack on mobile (<768px)
- **Example**:
```html
<div class="grid">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

## Components

### Navigation
- **Element**: `<nav>`
- **Structure**: Multiple `<ul>` elements distributed horizontally
- **Example**:
```html
<nav>
  <ul>
    <li><strong>Brand</strong></li>
  </ul>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

### Forms
- **Inputs**: `width: 100%` by default, sized consistently with buttons
- **Layout**: Can use `.grid` class for form layouts
- **Helper Text**: Use `<small>` elements
- **Example**:
```html
<form>
  <label>
    Name
    <input type="text" name="name" placeholder="Enter name" />
  </label>
  <small>Helper text goes here</small>
</form>
```

### Buttons
- **Default**: Semantic `<button>` elements are styled automatically
- **Variants**: `.secondary`, `.contrast`, `.outline`
- **Example**:
```html
<button>Primary</button>
<button class="secondary">Secondary</button>
<button class="outline">Outline</button>
```

### Modal
- **Element**: `<dialog>`
- **Structure**: Contains `<article>` with optional `<header>` and `<footer>`
- **Classes**: `.modal-is-open`, `.modal-is-opening`, `.modal-is-closing`
- **Example**:
```html
<dialog open>
  <article>
    <header>
      <button aria-label="Close" rel="prev"></button>
      <p><strong>Modal Title</strong></p>
    </header>
    <p>Modal content</p>
    <footer>
      <button class="secondary">Cancel</button>
      <button>Confirm</button>
    </footer>
  </article>
</dialog>
```

### Accordion
- **Elements**: `<details>` and `<summary>`
- **Behavior**: Native HTML, no JavaScript required
- **Group Control**: Use `name` attribute to allow only one open
- **Example**:
```html
<details name="group" open>
  <summary>Accordion Title</summary>
  <p>Content goes here</p>
</details>

<details name="group">
  <summary role="button" class="secondary">Button Style</summary>
  <p>More content</p>
</details>
```

## Semantic HTML Styling

### Typography
- All heading elements (`<h1>` to `<h6>`) are styled automatically
- `<p>`, `<blockquote>`, `<code>`, `<pre>` have consistent spacing
- `<strong>` and `<em>` have appropriate emphasis

### Lists
- `<ul>` and `<ol>` have consistent spacing
- Inside `<nav>`, `<ul>` elements become horizontal

### Tables
- `<table>` elements are responsive and styled by default
- Use `<thead>`, `<tbody>`, `<tfoot>` for proper structure

## Best Practices

### 1. Semantic First
Always start with proper semantic HTML before adding classes:
```html
<!-- Good -->
<article>
  <header>
    <h1>Article Title</h1>
  </header>
  <p>Article content</p>
</article>

<!-- Avoid unnecessary divs -->
<div class="article">
  <div class="header">
    <h1>Article Title</h1>
  </div>
</div>
```

### 2. Use Class-less When Possible
Leverage Pico's semantic styling before adding utility classes:
```html
<!-- Automatically styled -->
<main>
  <section>
    <h2>Section Title</h2>
    <p>Content here</p>
  </section>
</main>
```

### 3. Form Accessibility
Always include proper labels and helper text:
```html
<label>
  Email Address
  <input type="email" name="email" required />
  <small>We'll never share your email</small>
</label>
```

### 4. Responsive Navigation
Use multiple `<ul>` elements for flexible navigation:
```html
<nav>
  <ul>
    <li><strong>Logo</strong></li>
  </ul>
  <ul>
    <li><a href="/link1">Link 1</a></li>
    <li><a href="/link2">Link 2</a></li>
  </ul>
</nav>
```

## Dark Mode Support
- Automatic dark/light mode based on system preference
- Use `<meta name="color-scheme" content="light dark">` in `<head>`
- Colors automatically adapt without additional code

## Common Patterns for This Project

### Layout Structure
```html
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.jade.min.css">
  </head>
  <body class="container">
    <header>
      <nav><!-- Navigation here --></nav>
    </header>
    <main><!-- Main content --></main>
    <footer><!-- Footer content --></footer>
  </body>
</html>
```

### Form Validation with Hono
```html
<form action="/signup" method="post">
  <label>
    Name
    <input type="text" name="name" required />
  </label>
  <label>
    Email
    <input type="email" name="email" required />
  </label>
  <label>
    Password
    <input type="password" name="password" required />
  </label>
  <button type="submit">Sign Up</button>
</form>
```

## Key Reminders
- Pico CSS does NOT include JavaScript - handle interactions separately
- Grid system is minimal by design - use CSS Grid or Flexbox for complex layouts
- Always test responsive behavior on mobile devices
- Prefer semantic HTML over div-heavy structures
- Use utility classes sparingly - leverage semantic styling first