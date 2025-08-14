FROM node:16-alpine

WORKDIR /app

# First copy only package files to leverage Docker cache
COPY package.json ./
COPY package-lock.json* ./

# Clean install dependencies
RUN npm ci || npm install

# Copy the rest of the application
COPY . .

# Create a .env file for React
RUN echo "REACT_APP_STUDENT_SERVICE_URL=http://localhost:8000" > .env
RUN echo "REACT_APP_COURSE_SERVICE_URL=http://localhost:8001" >> .env

EXPOSE 3000

# Start the application
CMD ["npm", "start"]