# Resume Builder

Welcome to **Resume Builder** – your one-stop solution for creating professional resumes effortlessly!  
This is my first DevOps project, designed to automate, streamline, and modernize the resume-building process.  
Whether you're a job seeker, student, or professional, this project aims to help you craft stunning resumes with ease.

---

## 🚀 Project Overview

Resume Builder is a web application that allows users to input their details and generate a beautifully formatted resume in minutes. The project also demonstrates modern DevOps practices including CI/CD, containerization, and infrastructure as code.

---

## 🛠️ Key Features

- **User-Friendly Interface**: Fill out your information through an intuitive form.
- **Customizable Templates**: Choose from multiple professional templates.
- **PDF Export**: Download your resume as a high-quality PDF.
- **Real-time Preview**: See changes as you type.
- **DevOps Automation**:  
  - Automated builds and deployments via CI/CD pipelines.
  - Dockerized application for seamless deployment.
  - Infrastructure as code for reproducible environments.

---

## 💻 Tech Stack

- **Frontend**: Vite.js
- **Backend**: Nodejs/Superbase
- **Database**: PostgreSQL
- **DevOps Tools**:
  - **Docker**: Containerization
  - **Jenkins**: CI/CD
  - **Terraform**: Infrastructure as Code
  - **Cloud Provider**: AWS

---

## 🚦 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/ABHIRAM3046/Resume-Builder.git
cd Resume-Builder

# Build and run with Docker
docker build -t resume-builder .
docker run -p 8080:8080 resume-builder

# Or, run locally (if not using Docker)
npm install
npm run dev
```

---

## 🧩 CI/CD Pipeline

This project uses Jenkins for continuous integration and deployment:

- **On every push:** Code is linted, tested, and built.
- **On merge to main:** Application is automatically deployed to minikube running on an separate EC2 VM.

---

<!--## 📸 Screenshots

<!-- Add screenshots/gifs of your app here -->
<!-- Example: ![Demo](screenshots/demo.png) -->

<!---->

## 🌐 Live Demo

[Vercel Deployment](https://resume-builderoi.vercel.app/)!

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to open issues or submit pull requests for new features, bug fixes, or improvements.

---

## 🙋‍♂️ About Me

I'm **Abhiram** – passionate about DevOps and modern software engineering.  
Connect with me on [LinkedIn](https://www.linkedin.com/in/abhiram-varma-jampana-6131ab267/)!

---

## 📄 License

[MIT](LICENSE)

---

> _Thank you for checking out Resume Builder! If you like this project, please give it a ⭐ and share it on LinkedIn!_
