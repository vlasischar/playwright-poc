# Project README

## Introduction

Welcome to this JavaScript project using Playwright for web testing. This README file provides a brief overview of the setup process and how to run the tests using the provided scripts.

## Prerequisites

- Node.js (>= 14.x) and npm installed on your system.

## Installation

1. Clone the repository or download the project files to your local machine.

2. Navigate to the project directory in your terminal or command prompt.

3. Install the required dependencies by running: <code>npm install</code>

This command will install the `node_modules` folder, which contains all the necessary dependencies, including Playwright.

4. After installing the dependencies, you need to install the browser binaries required by Playwright. Run the following command:
   <code>npx playwright install</code>

## Running the tests

In the `package.json` file, there are two scripts defined for running tests:

1. **test**: This script runs the tests using the default configuration.
   <code>npm run test</code>

2. **test:debug**: This script runs the tests in headed mode, which means that you'll see the browser running the tests. This is useful for debugging and visual inspection.

   <code>npm run test:debug</code>
