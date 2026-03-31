# Coverly

`React` `TypeScript` `Create React App` `React Router` `Axios` `HTML-to-Image`

## Overview
Coverly is a React application for discovering book covers and organizing reading moments. It lets you search for books by title/author, save recent searches, explore top picks, and build a shareable reading retrospective story with ratings and genres. It also includes an optional Toggl Track integration to display logged reading hours for a searched title.

## Features
- Search books by title and optional author.
- View book details and cover previews.
- Keep a short, persistent search history.
- Generate a “retrospectiva” story card with ratings, genres, and page counts.
- View curated top books.
- (Optional) Pull reading hours from Toggl Track for a searched title.

## Screenshot
If you can run the app locally, add a screenshot of the homepage here:

```
![Homepage screenshot](docs/images/homepage.png)
```

## Tech Stack
- React + TypeScript (Create React App)
- React Router
- Axios
- html-to-image

## Getting Started

### Install
```bash
npm install
```

### Run
```bash
npm start
```

### Test
```bash
npm test
```

### Build
```bash
npm run build
```

## API Requirements
This frontend expects a backend running at `http://localhost:3001` by default.
- Book search endpoint: `GET /books/search?q=...`
- Cover proxy endpoint: `GET /books/cover?url=...`
- Toggl Track endpoint: `GET /toggl/books?title=...`

You can override the base URL for Toggl with `REACT_APP_API_BASE_URL`.
