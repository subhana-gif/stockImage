
# Stock Image Management System

This is a full-stack application that allows users to upload, manage, and rearrange images. The frontend is built using React and Vite, while the backend is built with Express.js. The project includes user authentication, image upload, image editing, deletion, and reordering functionality.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Email service credentials for Nodemailer

## Setting Up the Application Locally

### 1. Clone the Repository

Clone the repository to your local machine:

git clone https://github.com/subhana-gif/stockImage.git
cd stockImage

### 2. Setup the Backend

Navigate to the backend directory and install the required dependencies:

cd backend
npm install

### 3. Create a `.env` File

Create a `.env` file in the `backend` directory and add the following variables:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password

Replace the placeholders with your actual credentials.

### 4. Start the Backend

Start the backend server:

npm start

The backend will run on [http://localhost:5000](http://localhost:5000).

### 5. Setup the Frontend

Navigate to the frontend directory and install the required dependencies:

cd my-image-app
npm install

### 6. Start the Frontend

Start the frontend development server:

npm run dev

The frontend will run on [http://localhost:5173](http://localhost:5173).

### 7. Access the Application

- The frontend will be available at [http://localhost:5173](http://localhost:5173).
- The backend API will be available at [http://localhost:5000](http://localhost:5000).

## Deployment

To deploy the application, you can use services like Heroku, Vercel, or any other hosting provider. Make sure to set the environment variables on the deployed server.


## Acknowledgements

- Express.js for the backend
- React and Vite for the frontend
- Multer for handling file uploads
- JWT for user authentication
- Nodemailer for email handling


