# marvel characters

[![Build Status](https://github.com/dennervidal/marvel-characters/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/dennervidal/marvel-characters/actions/workflows/ci.yml)

This project uses Marvel API for characters, listing on homepage all available characters
and provides a search tool for the user, based on character starting name string.

You can access the deployed app [here](https://marvel-characters-theta.vercel.app/)

## getting started

First of all, you will need a Marvel developer account API key from [here](https://developer.marvel.com) 
and then create a `.env` file or set the environment variable named `NEXT_PUBLIC_API_PUBLIC_KEY` (`.env.example` file is on this repo root).

After that, make sure you have:
 - `pnpm` >= 7
 - `nodejs` >= 14
 
## technologies

The codebase contains the following:
 - `nextjs` to build the application, fully responsive, functional components and routing
 - `@material-ui` as primary visual components library
 - `styled-components` for customization
 - `prettier` for code formatting
 - and many other tweaks as absolute imports, commit hooks, service layers and ci build check

In the project directory, you can run:

### `pnpm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `pnpm run build`

Builds the app for production.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `pnpm run test`

Run unit tests for some components.

## folder structure

 - `src`
   - `components`: reusable components
   - `context`: application context
   - `hooks`: custom hooks implementation
   - `pages`: application pages
   - `service`: api service layer
   - `utils`: general js files