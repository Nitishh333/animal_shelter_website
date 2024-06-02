const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session =require('express-session');
const flash = require('express-flash');
const bodyParser=require("body-parser");
const multer=require("multer");


const Contact = require("./models/contact");
const Volunteer=require("./models/volunteer");
const Task = require("./models/tasks");
const Animal=require("./models/storeadoption");
const adoptiondetails=require("./models/adoptionform");

app.use(session({
  secret:"secret key",
  resave:false,
  saveUninitialized:true,
  cookie:{
    maxAge:600000
  }
}))

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


app.use(flash());


app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: true }));
// Serve the 'uploads' directory statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const Storage=multer.diskStorage({
  destination:'uploads',
  filename:(req,file,cb)=>{
    cb(null,file.originalname);
  },
});

const upload=multer({
  storage:Storage
}).single('testImage')


mongoose.connect("mongodb://localhost:27017/AnimalWelfare")
  .then(() => {
    console.log("CONNECTION OPEN!!!")
  })
  .catch((err) => {
    console.log("OH NO ERROR");
    console.log(err);
  })

// app.set('views', path.join(__dirname, 'views'));
// app.set('views', path.join(__dirname, 'views', 'contacts'));
app.set('views', path.join(__dirname, 'views'));


app.set('view engine', 'ejs');
// app.use(express.static(path.join(__dirname, 'views/contact/')));
//  app.set('views', path.join(__dirname, 'views', 'contact'));


//storage



app.get('/queries', async (req, res) => {
  try {
    // Fetch queries data from the database
    const queries = await Contact.find({});
    const queriess = path.join(__dirname,'views','contacts','queries.ejs');

    // Render the admin dashboard with the queries data
    res.render(queriess, { queries: queries });
  } catch (error) {
    console.error('Error rendering queries:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/admin/volunteer', async (req, res) => {
  
  try {

    const volunteers = await Volunteer.find({});
    const voladm = path.join(__dirname,'views','contacts','adminvolunteer.ejs');

    console.log("kfjskf");
    res.render(voladm, { volunteers: volunteers });
  } catch (error) {
    console.error('Error rendering adminvolunteer:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/home',(req,res) => {
  const Homepage = path.join(__dirname, 'home.html');
  res.sendFile(Homepage);
})
app.get('/volunteer/login', (req, res) => {
  
  const volunteerLoginPath = path.join(__dirname,'views','contacts','volunteerLogin.ejs');
  const message="";
  res.render(volunteerLoginPath,{message:message});
});

app.get('/volunteer/signup', (req, res) => {
  const signup = path.join(__dirname,'views','contacts','signup.ejs');
  const message = ""; 
  res.render(signup, { message: message });
});


app.get("/contact",(req,res)=>
{
  const ContactPath=path.join(__dirname,'contact.html');

  res.sendFile(ContactPath);
})

app.get("/aboutorgan", (req, res) => {
  const AboutPath = path.join(__dirname, 'about.html');
  res.sendFile(AboutPath);
});

app.get("/location",(req,res)=>{
  const locpath=path.join(__dirname,("location.html"))
  res.sendFile(locpath);
})


app.post("/upload",(req,res)=>{
  upload(req,res,(err)=>{
    if(err){
      console.log(err)
    }
    else{
      const newImage=new Animal({
        name:req.body.name,
        age:req.body.age,
        breed:req.body.breed,
        gender:req.body.gender,
        description:req.body.des,
        image:{
          data:req.file.filename,
          contentType:'image/png'
        }
      })
      newImage.save()
      .then(()=>res.send("successfully uploaded")).catch(err=>console.log(err))
    }
  })
})
app.post('/contacts', async (req, res) => {
  console.log(req.body);

  
  const newContact = new Contact({
    name: req.body.name,
    phoneno: req.body.phoneno, 
    email: req.body.email,
    category: req.body.category,
    reason: req.body.reason
  });

 
  await newContact.save();
  res.send('Form submitted successfully!');
});






app.post("/volsignup", async (req, res) => {
  try {
    const userEmail = req.body.email;
    const volunteer = await Volunteer.findOne({ email: userEmail });

    let message;
    if (volunteer) {
      message = "Email already exists";
      
    } else {
      message = "yes";
      // Create a new Volunteer instance
      const newVolunteer = new Volunteer({
        name: req.body.name,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        password: req.body.password
      });

      // Save the newVolunteer instance to the database
      await newVolunteer.save();
      

    }

    const signup = path.join(__dirname,'views','contacts','signup.ejs');


    // Render the signup page with the appropriate message
    res.render(signup, { message: message });

  } catch (error) {
    console.error("Error checking email in database:", error);
    res.status(500).json({ error: "Error checking email in database" });
  }
});




//volunteer login

app.post('/volunteer/login', async (req, res) => {
  try {
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    const volunteerProfile = path.join(__dirname,'views','contacts','volunteerProfile.ejs');
    const volunteerLogin = path.join(__dirname,'views','contacts','volunteerLogin.ejs');


    
    const volunteer = await Volunteer.findOne({ email: userEmail, password: userPassword });

   
    if (volunteer) {
     
      const tasks = await Task.find({ volunteer: volunteer._id });

     
      res.render(volunteerProfile, { volunteer: volunteer, tasks: tasks });
    } else {
      res.render(volunteerLogin, { message: 'fails' });
    }
  } catch (error) {
    console.error('Error during volunteer login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/assign/tasks', async (req, res) => {
  try {
    const { title, description,volunteer } = req.body;

    const newTask = new Task({
      title,
      description,
      volunteer
    });
  

    await newTask.save();

    res.status(201).send('Task created successfully!');
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get("/admin",(req,res)=>{
  const AdminPath = path.join(__dirname, 'dashhhh.html');

  res.sendFile(AdminPath);
})

app.get('/images', async (req, res) => {
  const imgs = path.join(__dirname,'views','contacts','imgs.ejs');
  
  try {
    const images = await Animal.find({});

    res.render(imgs, { images: images });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).send('Internal Server Error');
  }
});





app.get('/admin/update', async (req, res) => {
  try {
    const volunteers = await Volunteer.find({});

    const tasks = await Task.find({});
    const updating = path.join(__dirname,'views','contacts','updating.ejs');

    const volunteersWithTasks = volunteers.map(volunteer => {
      const volunteerTasks = tasks.filter(task => task.volunteer.toString() === volunteer._id.toString());
      return { ...volunteer.toObject(), tasks: volunteerTasks };
    });

    res.render(updating, { volunteers: volunteersWithTasks });
  } catch (error) {
    console.error('Error rendering admin dashboard:', error);
    res.status(500).send('Internal Server Error');
  }
});


//delete


app.delete('/admin/delete/volunteer/:id', async (req, res) => {
  const volunteerId = req.params.id;
  try {
 
    await Volunteer.findByIdAndDelete(volunteerId);
    res.status(200).send("Volunteer deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting volunteer");
  }
});

app.delete('/admin/delete/task/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
    
    await Task.findByIdAndDelete(taskId);
    res.status(200).send("Task deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting task");
  }
});


//delete queries

app.delete('/admin/delete/query/:id', async (req, res) => {
  const queryId = req.params.id;
  try {
    await Contact.findByIdAndDelete(queryId);
    res.status(200).send("Query deleted successfully");
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).send("Error deleting query");
  }
});


// delete adoption request

app.delete('/admin/delete/adoption/:id', async (req, res) => {
  const requestId = req.params.id;
  try {
    await adoptiondetails.findByIdAndDelete(requestId);
    res.status(200).send("Adoption request deleted successfully");
  } catch (error) {
    console.error('Error deleting adoption request:', error);
    res.status(500).send("Error deleting adoption request");
  }
});


// app.get("/adoption",(req,res)=>{
//   const adoption = path.join(__dirname,'views','contacts','adoption.ejs');

//   res.render(adoption);
// })

// Assuming you have already imported necessary dependencies and set up your Express app

// Route to fetch data from MongoDB and render the adoption page with dynamic cards
app.get("/adoption", async (req, res) => {
  try {
    const adoption = path.join(__dirname,'views','contacts','adoption.ejs');
    // Fetch data from MongoDB, assuming you have a model named Animal
    const animals = await Animal.find({});

    // Render the adoption page and pass the retrieved data to the template
    res.render(adoption, { animals: animals });
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});







app.get("/add/animals",(req,res)=>{
  const adminaddanimals=path.join(__dirname,'adminadoption.html');

  res.sendFile(adminaddanimals);
})

app.get('/dogs/:id', async (req, res) => {
  try {
    const dogdetails = path.join(__dirname,'views','contacts','dogdetails.ejs');

    const animal = await Animal.findById(req.params.id);
    res.render(dogdetails, { animal });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching dog details');
  }
});



//TESTING

//TESTING



//TESTING
//TESTING
app.get("/help", async (req, res) => {
  try {
    const emailToFind = "nitfishnnn25@gmail.com"; // Email to find in the Volunteer database
    const volunteer = await Volunteer.findOne({ email: emailToFind });
    let message = ""; // Initialize an empty message
    if (volunteer) {
      // If volunteer is found, set the message
      message = "Volunteer with email " + emailToFind + " found!";
    } else {
      // If volunteer is not found, set a different message
      message = "Volunteer with email " + emailToFind + " not found.";
    }

    // Render the testing template and pass the message
    res.render("testing", { message: message });
  } catch (error) {
    console.error('Error finding volunteer:', error);
    res.status(500).json({ error: 'Error finding volunteer' });
  }
});


app.post("/help", async (req, res) => {
  try {
    const userEmail = req.body.email; // Assuming you're submitting user email via a form input field
    const volunteer = await Volunteer.findOne({ email: userEmail });

    let message;
    if (volunteer) {
      message = "";
    } else {
      message = "Email not found in database";
    }

    res.render("testing", { message: message });
  } catch (error) {
    console.error("Error checking email in database:", error);
    res.status(500).json({ error: "Error checking email in database" });
  }
});



//adoption form detailss

app.post('/adopt', async (req, res) => {
  try {
    // Create a new Adoption document with the data from the request body
    const adoption = new adoptiondetails({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      message: req.body.message,
      animal: req.body.animalId // Assuming you're passing the animal's ID as "animalId" in the form
    });

    // Save the adoption document to the database
    const savedAdoption = await adoption.save();

    // Redirect or send a success response
    res.send('Adoption details saved successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving adoption details.');
  }
});

app.get("/adoption/requests", async (req, res) => {
  try {
   
    const formdetails = path.join(__dirname, 'views', 'contacts', 'displayadoptionrequests.ejs');

    
    const adoptionRequests = await adoptiondetails.find({});

    // Create an array to store promises for retrieving animal details
    const animalPromises = adoptionRequests.map(async (request) => {
      // Fetch the animal details based on the animal ID stored in the adoption request
      const animal = await Animal.findById(request.animal);
      return { ...request.toObject(), animal: animal }; // Merge the animal details into the request object
    });

    // Execute all promises concurrently to fetch animal details for each adoption request
    const adoptionRequestsWithAnimalDetails = await Promise.all(animalPromises);

    res.render(formdetails, { adoptionRequests: adoptionRequestsWithAnimalDetails });
  } catch (error) {
    console.error("Error fetching adoption requests:", error);
    res.status(500).send("Internal Server Error");
  }
});








app.listen(3000, () => {
  console.log("APP IS LISTENING ON PORT 3000");
});
