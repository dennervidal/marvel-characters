# marvel characters

[![Build Status](https://travis-ci.org/dennervidal/marvel-characters.svg?branch=master)](https://travis-ci.org/dennervidal/marvel-characters)

This project uses Marvel API for characters, listing on homepage all available characters
and provides a search tool for the user, based on character starting name string.

You can access the deployed app [here](https://master.d20kbch1h1r0t5.amplifyapp.com/)

## getting started

First of all, you will need a Marvel developer account API key from [here](https://developer.marvel.com) 
and then create a `.env` file or set the environment variable named `REACT_APP_API_PUBLIC_KEY` (`.env.example` file is on this repo root).

After that, make sure you have:
 - `yarn` >= 1.12
 - `nodejs` >= 12
 
## technologies

The codebase contains the following:
 - `reactjs` to build a SPA application, fully responsive, functional components 
 - `@material-ui` as primary visual components library
 - `styled-components` for customization
 - `react-router` for handling browser routes
 - `eslint` and `prettier` for code formatting
 - and many other tweaks as absolute imports, commit hooks, service layers and ci build check

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `yarn test`

Run unit tests for some components.

## folder structure

 - `src`
   - `assets`: binary assets
   - `components`: reusable components
   - `context`: application context
   - `hooks`: custom hooks implementation
   - `pages`: application pages
   - `routes`: browser routes
   - `service`: api service layer
   - `utils`: general js files