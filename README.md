# The NCTimes — Interactive Editorial Portfolio

A unique, interactive editorial portfolio website styled as a classic broadsheet newspaper, built for a freelance client w/ Next.js and custom CSS 3D transforms, it offers a tactile, engaging experience for showcasing projects, articles, case studies, and career achievements.

<img width="2042" height="1486" alt="Landing" src="https://github.com/user-attachments/assets/e83901b1-5192-43a7-8bd8-8921b9905b42" />
<img width="1772" height="883" alt="Article" src="https://github.com/user-attachments/assets/b560afae-dcb5-40df-a02c-dd6eac22d37b" />

## ✨ Features

- **Authentic Newspaper Experience:** Features a custom-built 3D page-flip interaction. Drag to turn pages on desktop or swipe on mobile, all implemented natively without heavy third-party layout libraries.
- **Responsive Layout:** Transitions seamlessly from a two-page spread on large screens to a single-page view on mobile devices. Uses dynamic viewport scaling to ensure the paper always fills the screen perfectly.
- **Static Site Generation (SSG):** Built with Next.js static exports (`output: export`) for lightning-fast performance and easy deployment to any static host (Vercel, GitHub Pages, Netlify, etc.).
- **Article Modals:** Interactive article cards that open in a detailed modal view with smooth client-side routing, adjacent article navigation (prev/next), and proper browser history support.
- **Content Driven:** Content is managed via JSON and MDX. Adding new articles and portfolio pieces is as simple as dropping a new markdown file into the content directory.

## 🛠️ Tech Stack

- **Framework:** [Next.js v16](https://nextjs.org/) (App Router, SSG)
- **UI:** React v19
- **Styling:** Vanilla CSS (Custom Design System, CSS Variables, 3D Transforms)
- **Language:** TypeScript

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
# or yarn install / pnpm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The pages will hot-reload as you make edits.

## 📦 Building for Production

To create a static production build:

```bash
npm run build
```

This command generates an optimized static output in the `out/` directory. You can preview this build locally using:

```bash
npx serve@latest out
```

The contents of the `out/` directory can be deployed to any static hosting provider.

## 📝 Adding Content

Please refer to the `POST_GUIDELINES.md` file in the root directory for detailed instructions on how to author new articles, format YAML frontmatter, and manage images/videos.

## 🏗️ Architecture Highlights

- **`PageFlipBook.tsx`:** The core controller for the flipbook interaction, handling drag-vs-click detection, touch swipes, and symmetric CSS 3D (`rotateY`) leaf geometry.
- **`ArticleModal.tsx`:** Manages the presentation of full articles over the newspaper layout, handling document click delegation, popstate events, and adjacent article navigation.
- **`globals.css`:** Contains the global design system, typography variables linked to Next.js font loaders, and complex responsive layout rules.

## 📄 License

This project is open-sourced under the MIT License. Feel free to use it for your own portfolio!
