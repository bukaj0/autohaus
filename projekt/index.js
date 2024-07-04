/*
This is the main class where all requests are processed
 */

//load the webserver component
const express=require('express');
const path = require('path');
const app=express();
const port=3000; //ensure that the port is not in use in your system, otherwise change the port

global.currentUser = { 
    id: 999, 
    firstName: 'Test', 
    lastName: 'User',
    email: 'test@test.com',
    pwd: 'pwd',
    type: 'customer'
};

//load dbs operations
const dbsops=require('./database/dbsoperations')

//set the views: templates that are rendered: look in the folder /views for changing them
app.set('views', path.join(__dirname, 'views')); // Use an absolute path
app.set('view engine', 'pug');  //pug is the template rendering engine

app.use(express.static(path.join(__dirname, 'public')));

//use that to process requests
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/***********************routes******************/

//all requests go through that method, can be used for debugging
app.use((req,res,next)=>{
    console.log(`URL: ${req.url}`);
    next();
})

//basic navigation example without any database operations
//if you enter localhost:3000/static/{any number} this method will be fired
app.get('/static/:section',(req,res)=>{
    //res.status(200).send('Hello,!');
    if(req.params.section=="main") {
        //if you enter localhost:3000/main this page (static) will be delivered
        res.status(200).sendFile(__dirname + '/index.html');
    }else{
        //in all other cases, that page will be delivered
        res.status(200).sendFile(__dirname + '/index2.html')
    };
});


//if you enter localhost:3000/all then this method will be fired
//it delivers all the data from a table
app.get('/all',async (req,res)=>{
    //query data from table
    var result=await dbsops.queryDataFromTable();
    //forward the data to the template, there it is rendered
    res.render('all', {
        mdata: result.rows
    });
});


app.get('/newId',async (req,res)=>{
    res.render('insertDataTemplate');
});

//add a new line to table t1
//it inserts the data to the database
app.post('/newId',async (req,res)=>{
    console.log(req.body.mid);
    await dbsops.inserDataToTable(req.body.mid,req.body.mname);
    console.log("deliver new page...");
    res.status(200).send("New data inserted");
});

//calls the stored procedure
app.get('/procedure/:procValue',async (req,res)=>{
    console.log(req.body.mid);
    var result=await dbsops.callStoredProcedure(req.params.procValue);
    console.log("deliver new page...");
    res.status(200).send("Value from Procedure:" + result.pOutput);
});


//-------------------------------------------------------------------
//endpoint for cars
app.get('/api/cars', async (req, res) => {
    const { brand, fromYear, toYear, fromPrice, toPrice } = req.query;
    try {
        if (brand && !fromYear && !toYear && !fromPrice && !toPrice) {
            console.log("Fetching cars for brand:", brand);
            const result = await dbsops.queryCarsByBrand(brand);
            if (result) {
                res.json(result);
            } else {
                res.status(500).send('Error retrieving cars by brand');
            }
        } 
        else {
            console.log("Fetching search cars...",brand,fromYear,toYear,fromPrice,toPrice);
            const result = await dbsops.queryCarFromTable(brand,fromYear,toYear,fromPrice,toPrice);
            if (result) {
                res.json(result);
            } else {
                res.status(500).send('Error retrieving search cars');
            }
        }
    } 
    catch (error) {
        console.error("Failed to retrieve cars:", error);
        res.status(500).send("Server error");
    }
});

//endpoint for getting reviews
app.get('/api/reviews', async (req, res) => {

    const userId = req.query.userId;
    console.log(userId);
    try {
        console.log("fetching all reviews?",userId);
        const result = await dbsops.queryReviews(userId);
        if (result) {
            res.json(result);
        } else {
            res.status(500).send('Error retrieving reviews');
        }
    } 
    catch (error) {
        console.error("Failed to retrieve review:", error);
        res.status(500).send("Server error");
    }
});
//endpoint for creating reviews
app.post('/api/reviews/create', async (req, res) => {

    const rating = req.query.rating;
    const text = req.query.text;
    console.log("creating review with ",rating,text);
    try {
        const result = await dbsops.createReview(rating,text);
        if (result) {
            res.json(result);
        } else {
            res.status(500).send('Error adding reviews');
        }
    } 
    catch (error) {
        console.error("Failed to add review:", error);
        res.status(500).send("Server error");
    }
});
//endpoint for updating reviews
app.post('/api/reviews/update', async (req, res) => {
    const reviewId = req.query.reviewId;
    const rating = req.query.rating;
    const text = req.query.reviewText;

    console.log("Updating review with ID:", reviewId, "Rating:", rating, "Text:", text);

    try {
        const result = await dbsops.updateReview(reviewId, rating, text);
        if (result) {
            res.json(result);
        } else {
            res.status(404).send('Review not found');
        }
    } 
    catch (error) {
        console.error("Failed to update review:", error);
        res.status(500).send("Server error");
    }
});

//endpoint for deleting review
app.post('/api/reviews/delete', async (req, res) => {
    const reviewId = req.query.reviewId;

    console.log("deleting review id: ", reviewId);

    try {
        const result = await dbsops.deleteReview(reviewId);
        if (result) {
            res.json(result);
            console.log("deleted review yay!");
        } else {
            res.status(404).send('Review not deleted');
        }
    } 
    catch (error) {
        console.error("Failed to delete review:", error);
        res.status(500).send("Server error");
    }
});



// endpoint for user data
app.get('/api/user', (req, res) => {
    if (global.currentUser) {
        res.json(global.currentUser);
        console.log(global.currentUser);
    } else {
        res.status(500).send('user is fucked');
    }
});


// Endpoint to handle the car booking
app.post('/api/book-car', async (req, res) => {
    const carId = req.query.carId;
    console.log(carId);
    try {
        console.log("booking test drive:", carId);
        const result = await dbsops.bookTestDrive(carId);
        if (result) {
            res.json(result);
        } else {
            res.status(500).send('Error retrieving booking');
        }
    } 
    catch (error) {
        console.error("Failed to book test drive:", error);
        res.status(500).send("Server error");
    }
});

// Endpoint to handle the car booking
app.post('/api/book-car/remove', async (req, res) => {
    console.log("deleting test drive ");
    try {
        const result = await dbsops.deleteTestDrive(null);
        if (result) {
            res.json(result);
            console.log("deleted testdrive yay!");
        } else {
            res.status(404).send('testdrive not deleted');
        }
    } 
    catch (error) {
        console.error("Failed to delete testdrive:", error);
        res.status(500).send("Server error");
    }
});

//endpoint for getting booked testdrive
app.get('/api/testdrive', async (req, res) => {
    try {
        console.log("fetching testdrive for: ",global.currentUser.id);
        const result = await dbsops.queryTestDrive(global.currentUser.id);
        if (result) {
            res.json(result);
        } else {
            res.status(500).send('Error retrieving testdrive');
        }
    } 
    catch (error) {
        console.error("Failed to retrieve review:", error);
        res.status(500).send("Server error");
    }
});
//endp

//-------------------------------------------------------------------


//home page customer
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'));
});

app.post('/login', async (req, res) => {
    const { email, password, type } = req.body;
    console.log(email, password, type);
    const result = await dbsops.checkPassword(email, password, type);
    if (!result || result.rows.length === 0) {
        console.log("Login not successful");
        res.send("Login not successful");
    } else {
        const user = result.rows[0];
        console.log("Login successful", result.rows[0]);
        if (type === 'customer') {
            res.redirect('/home-customer');
            global.currentUser = {
                id: user[0],
                firstName: user[1],
                lastName: user[2],
                email: user[3],
                pwd: user[4],
                type: 'customer'
            };
        } else {
            res.redirect('/home-employee');
            global.currentUser = {
                id: user[0],
                firstName: user[1],
                lastName: user[2],
                email: user[3],
                pwd: user[4],
                type: 'employee'
            };
            
        }
    }
});




//home page customer
app.get('/home-customer', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/home-customer.html'));
});

//home page employee
app.get('/home-employee', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/home-employee.html'));
});

//discover page
app.get('/home-customer/discover', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/discover.html'));
});

//search page
app.get('/home-customer/search', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/search.html'));
});

//register customer Page
app.get('/register-customer', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/register-customer.html'));
});

app.post('/register-customer', async (req, res) => {
    const { surname, name, email, password } = req.body;
    console.log("Received data:", { name, surname, email, password });

    try {
        const result = await dbsops.registerCustomer(name, surname, email, password);
        if (result) {
            console.log("Registration successful");
            global.currentUser = { name, surname, email };
            res.redirect('/login');
        } else {
            console.log("Registration not successful");
            res.send("Registration not successful");
        }
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send("Internal server error");
    }
});

//register employee Page
app.get('/register-employee', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/register-employee.html'));
});

//TODO: CHANGE TO EMPLOYEE
app.post('/register-employee', async (req, res) => {
    const { surname, name, email, password } = req.body;
    console.log("Received data:", { name, surname, email, password });

    try {
        const result = await dbsops.registerEmployee(name, surname, email, password);
        if (result) {
            console.log("Registration successful");
            global.currentUser = { name, surname, email, password };
            res.redirect('/login');
        } else {
            console.log("Registration not successful");
            res.send("Registration not successful");
        }
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send("Internal server error");
    }
});

// review
app.get('/home-customer/reviews', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/review.html'));
});

// review
app.get('/home-customer/myreviews', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/myreviews.html'));
});

//testdrive
app.get('/home-customer/booked', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/testdrive.html'));
});

//manage cars
app.get('/home-employee/manage-cars', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/manage-cars.html'));
});

//statistics
app.get('/home-employee/statistics',(req,res) => {
    res.sendFile(path.join(__dirname, 'public/statistics.html'))
});

//reviews employee
app.get('/home-employee/reviews',(req,res) => {
    res.sendFile(path.join(__dirname, 'public/employee-review.html'))
});
//parts
app.get('/home-employee/parts',(req,res) => {
    res.sendFile(path.join(__dirname, 'public/parts.html'))
});
//transaction employee

app.get('/home-employee/transactions',(req,res) => {
    res.sendFile(path.join(__dirname, 'public/transactions.html'))
});

app.get('/home-employee/booked',(req,res) => {
    res.sendFile(path.join(__dirname, 'public/allbooked.html'));
});

app.get('/home-customer/purchased-cars',(req,res) =>{
    res.sendFile(path.join(__dirname, 'public/purchased-cars.html'));
})

//add new car
app.post('/add-car', async (req, res) => {
    console.log(req.body);
    try {
        const {
            marke, modell, baujahr, preis, leistung, typ, klasse, beschreibung,
            zylinder, drehmoment, treibstoff, max_geschwindigkeit, antrieb, schaltung,
            gewicht, marke_bild, auto_bild
        } = req.body;

        await dbsops.addCar({
            marke, modell, baujahr, preis, leistung, typ, klasse, beschreibung,
            zylinder, drehmoment, treibstoff, max_geschwindigkeit, antrieb, schaltung,
            gewicht, marke_bild, auto_bild
        });

        res.send('Car added successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding car to database');
    }
});

//endpoint for manager cars
app.post('/api/queryManagerCars', async (req, res) => {
    const formData = req.body;
    console.log("LEISTUNGa",formData.leistung);
    try {
        console.log("Fetching manager car search for:", formData);
        const result = await dbsops.queryManagerCars(formData);
        if (result) {
            res.json(result);
        } else {
            res.status(500).send('Error retrieving cars manager');
        }
    } 
    catch (error) {
        console.error("Failed to retrieve cars:", error);
        res.status(500).send("Server error");
    }
});

//updateCar
app.post('/api/updateCar', async (req, res) => {
    const formData = req.body;
    try {
        console.log("updating.....: ", formData);
        const result = await dbsops.updateCar(formData);
        if (result) {
            res.json(result);
        } else {
            res.status(404).send('Error updating Car');
        }
    } 
    catch (error) {
        console.error("Failed to update cars:", error);
        res.status(500).send("Server error");
    }
});

//deleteCar
app.get('/api/deleteCar', async (req, res) => {
    const id = req.query.id;
    console.log("CAR ID: ", id);
    try {
        console.log("Deleting car");
        const result = await dbsops.deleteCar(id);
        if (result) {
            res.json({ success: true });
        } else {
            res.status(404).send('Error deleting Car');
        }
    } catch (error) {
        console.error("Failed to delete car:", error);
        res.status(500).send("Server error");
    }
});

//carstatistics
app.get('/api/car-statistics', async (req, res) => {
    try {
        console.log("fetching car statistics");
        const result = await dbsops.carStatistics();
        if (result) {
            res.json(result);
        } else {
            res.status(500).send('Error retrieving reviews');
        }
    } 
    catch (error) {
        console.error("Failed to retrieve car statistics:", error);
        res.status(500).send("Server error");
    }
});

//transaction statistics
app.get('/api/transaction-statistics', async (req, res) => {
    try {
        console.log("fetching transaction statistics");
        const result = await dbsops.transactionStatistics();
        if (result) {
            res.json(result);
        } else {
            res.status(500).send('Error retrieving transaction statistics');
        }
    } 
    catch (error) {
        console.error("Failed to retrieve transaction statistics:", error);
        res.status(500).send("Server error");
    }
});

//user-count
app.get('/api/user-statistics', async (req, res) => {
    try {
        console.log("fetching user statistics");
        const result = await dbsops.userStatistics();
        if (result) {
            res.json(result);
        } else {
            res.status(500).send('Error retrieving reviews');
        }
    } 
    catch (error) {
        console.error("Failed to retrieve user statistics:", error);
        res.status(500).send("Server error");
    }
});

//get transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const result = await dbsops.getTransactions();
        if (result) {
            res.json(result);
        } else {
            res.status(500).send('Error retrieving transactions');
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Server error');
    }
});

//get all testdrives
app.get('/api/alltestdrives', async (req, res) => {

    try {
        console.log("querying all test drives");
        const result = await dbsops.getTestDrives();
        if (result) {
            console.log("found test drives");
            res.json(result);
        } else {
            res.status(500).send('Error retrieving test drives');
        }
    } catch (error) {
        console.error('Error retrieving test drives:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/managertestdrivedelete', async (req, res) => {
    const { kundeId } = req.query;

    console.log("Deleting test drive for kundeId:", kundeId);
    try {
        const result = await dbsops.deleteTestDrive(kundeId);
        if (result) {
            res.json(result);
            console.log("Deleted test drive");
        } else {
            res.status(404).send('Test drive not deleted');
        }
    } 
    catch (error) {
        console.error("Failed to delete test drive:", error);
        res.status(500).send("Server error");
    }
});

// get all beliefert
app.get('/api/beliefert', async (req, res) => {
    try {
        console.log("querying all beliefert");
        const result = await dbsops.getBeliefert();
        if (result) {
            res.json(result);
        } else {
            res.status(500).send('Error retrieving beliefert');
        }
    } catch (error) {
        console.error('Error retrieving beliefert:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/buy-car', async (req, res) => {
    carId = req.query.carId;
    try {
        console.log("Buying car with ID:", carId, "for user ID:", global.currentUser.id);
        const result = await dbsops.buyCar(carId, global.currentUser.id);
        
        if (result) {
            res.json({ message: 'Car bought successfully', result });
        } else {
            res.status(500).send('Error buying car');
        }
    } catch (error) {
        console.error('Error buying car:', error);
        res.status(500).send('Server error');
    }
});


app.get('/api/customer-transactions', async (req, res) => {
    const userId = global.currentUser.id;
    console.log("Querying transactions for user ID: ", userId);
    try {
        const transactions = await dbsops.getCustomerTransactions(userId);
        console.log("Transaction result: ", transactions);
        res.json({ transactions });
    } catch (error) {
        console.error('Error in /api/customer-transactions endpoint:', error);
        res.status(500).send({ error: error.message });
    }
});

//start the web server
app.listen(port,()=>{
    console.log('Server started...');
})