# Instructions for Setting Up the Project

Thank you for choosing to work with Ropstam! We are excited to provide you with instructions on how to set up the project on your local machine.

## Prerequisites

Before you proceed, please ensure you have the following software installed on your computer:

1. **Node.js and npm**: Next.js requires Node.js and npm (Node Package Manager) to be installed. If you don’t have them, you can download and install from the official website: [https://nodejs.org/](https://nodejs.org/).

## Step 1: Clone the Project

To begin, you'll need to clone the project repository from our Git repository. Open your terminal or command prompt and run the following command:

```bash
git clone <repository_url>
```

## Step 2: Install Project Dependencies

```bash
cd <project_directory>
```

Now, install the project dependencies by running the following command:

```bash
npm install
```

This will download and install all the required packages specified in the project's package.json file.

## Step 3: Build the Project

If the project is pre-built and you don't need to make any changes, you can skip this step. However, if you need to build the project for production, follow these instructions:

```bash
npm run build
```

It will start the build process, bundling your application for production. The resulting build output will be available in the dist directory. You can use the build in your wordpress site.

## Step 4: Start the Development Server

To view the project locally, use the following command:

```bash
npm run dev
```

This will start the development server, and you can access the application in your web browser by visiting http://localhost:3000.

## Conclusion

That's it! You have successfully set up our Next.js project on your local machine. If you encounter any issues or have any questions, don't hesitate to reach out to us for assistance.

Happy coding!
