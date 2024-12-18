# The DnD AI Program

## Running the Project:

1. **Clone the Repository:**
   Begin by cloning the repository to your local machine and navigating into the project directory. This will give you access to all the necessary files.
   ```sh
   git clone <repository_url>
   cd <project_directory>
   ```

2. **Set Up a Virtual Environment:**
   It's crucial to create a virtual environment to manage dependencies separately for this project. First, ensure you have `virtualenv` installed:
   ```sh
   pip install virtualenv
   ```
   Then, create and activate the virtual environment:
   ```sh
   python -m virtualenv env
   env\Scripts\activate # On Linux use source env/bin/activate
   ```
   To deactivate the virtual environment when done, simply run:
   ```sh
   env\Scripts\deactivate # On Linux use deactivate
   ```

3. **Install Dependencies:**
   With the virtual environment active, install all required packages using the `requirements.txt` file. This ensures your environment is set up with the correct versions of each package.
   ```sh
   pip install -r requirements.txt
   ```

4. **Start Docker Containers:**
   Use Docker Compose to start the necessary containers. This will set up the environment for the backend services.
   ```sh
   docker-compose up -d
   ```

5. **Launch the Django Server:**
   Navigate to the backend directory and start the Django development server. This will handle the backend operations of the application.
   ```sh
   cd backend
   py OR python manage.py runserver
   ```

6. **Launch the Angular Server:**
   open a new terminal and navigate to the frontend directory and start the Angular server. This will serve the frontend of your application.
   ```sh
   cd frontend
   ng serve -o
   ```

7. **Start Flask Servers for Gemini API Chatbot:**
   Navigate to the model directory and run the Flask servers. These servers handle different functionalities of the Gemini API chatbot.      
   ```sh
   cd model
   py OR python gen_txt_chat_srvr.py
   py OR python chrcter_creation.py
   py OR python lib_srvr.py
   ```

## Additional Notes:
- To fully implement the application, you will need to set up and configure a MongoDB API and a MySQL database. These databases are essential for data storage and retrieval. For more information, visit [MongoDB](https://www.mongodb.com/) and [MySQL](https://www.mysql.com/).
- Obtain a Gemini API key from your user account to enable API functionalities.
- It is advisable to use multiple IDE windows and split terminals to efficiently manage and run the Python files in the model folder. This setup can significantly enhance your workflow and productivity.
- cls - is also a nice command - clear the terminal screen. 
