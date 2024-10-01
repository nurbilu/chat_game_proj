# Use an official TensorFlow runtime as a parent image
FROM python:3.9-slim-bullseye

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install Python dependencies
RUN pip install -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000 6500 7652

# Run the training script when the container launches
CMD ["python", "gen_txt_chat_srvr.py", "chrcter_creation.py", "lib_srvr.py"]

