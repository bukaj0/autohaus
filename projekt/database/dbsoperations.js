const { query } = require('express');
const connect=require('./dbhelper');

//insert a new tuple to the database
async function inserDataToTable(myval,mname) {
    await connect.connection().then(async (conn)=>{
        console.log("connection successfully established!");
        const bindVars = {
            MYID_B: myval,
            MNAME: mname
        };
        console.log('Start inserting....');
        await conn.execute("INSERT INTO t1 (MID,MNAME) VALUES (:MYID_B,:MNAME)",bindVars);
        console.log('inserting done!');
        conn.commit();
        conn.close();
        return true;
    }).catch(()=>{
        console.log("connection failed! inserDataToTable");
        return false;
    });

    console.log("done!");
}

//querye data from a table
async function queryDataFromTable(){
    queryResult=null;
    await connect.connection().then(async (conn)=>{
        console.log("connection successfully established!");

        console.log('Start querying....');
        var result=await conn.execute("Select * from t1 ");
        conn.close();
        queryResult=result;
    }).catch(()=>{
        console.log("connection failed! querydatafromtable");
        return false;
    });

    console.log("done!");
    return queryResult;
}

async function callStoredProcedure(myval) {
    var result=null;
    await connect.connection().then(async (conn)=>{
        console.log("connection successfully established!");

        const bindVars = {
            pInput: myval,
            pOutput:{dir:connect.oracledb.BIND_OUT, type: connect.oracledb.NUMBER }
        };
        console.log('Start calling stored procedure....');
        result=await conn.execute("begin P1(:pInput,:pOutput); end;",bindVars);
        console.log(`Procedure called!`);
        conn.close();
        console.log(result);

    }).catch(()=>{
        console.log("connection failed! callstored");
        return false;
    });

    console.log("done!");
    return result.outBinds;
}

async function checkPassword(email,password,type)
{
    queryResult=null;
    await connect.connection().then(async (conn)=>{
        console.log("connection successfully established!");
        console.log('Start checking password....');
        if(type == 'customer')
        {
            console.log("CUSTOMER");
            result = await conn.execute(
                "SELECT * FROM Kunde WHERE email = :email AND pwd = :password",
                { email: email, password: password }
            );
        }
        else if (type == 'employee')
        {
            console.log("EMPLOYEE");
            result = await conn.execute(
                "SELECT * FROM Kunde WHERE email = :email AND pwd = :password",
                { email: email, password: password }
            );
        }
        conn.close();
        queryResult=result;
    }).catch(()=>{
        console.log("uhhh");
        return false;
    });

    console.log("done!");
    return queryResult;
}

async function registerCustomer(name, surname, email, password) {
    let queryResult = null;

    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");
        console.log('Start checking password....');

        try {
            const checkResult = await conn.execute(
                "SELECT * FROM Kunde WHERE email = :email AND pwd = :password",
                { email: email, password: password }
            );

            if (checkResult.rows.length > 0) {
                console.log("Customer already exists");
                queryResult = "Customer already exists";
            } else {
                const insertResult = await conn.execute(
                    "INSERT INTO Kunde (vorname, nachname, email, pwd) VALUES (:name, :surname, :email, :password)",
                    { name: name, surname: surname, email: email, password: password }
                );
                await conn.commit(); 
                console.log("Customer registered successfully");
                queryResult = insertResult;
                console.log(queryResult);
            }
        } catch (err) {
            console.error("SQL error:", err);
        } finally {
            await conn.close();
        }
    } catch (err) {
        console.error("Connection error:", err);
    }

    console.log("done!");
    return queryResult;
}

async function registerEmployee(name, surname, email, password) {
    let queryResult = null;

    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");
        console.log('Start checking password....');

        try {
            const checkResult = await conn.execute(
                "SELECT * FROM Kunde WHERE email = :email AND pwd = :password",
                { email: email, password: password }
            );

            if (checkResult.rows.length > 0) {
                console.log("Employee already exists");
                queryResult = "Employee already exists";
            } else {
                const insertResult = await conn.execute(
                    "INSERT INTO Mitarbeiter (vorname, nachname, email, pwd) VALUES (:name, :surname, :email, :password)",
                    { name: name, surname: surname, email: email, password: password }
                );
                await conn.commit();
                console.log("Employee registered successfully");
                queryResult = insertResult;
                console.log(queryResult);
            }
        } catch (err) {
            console.error("SQL error:", err);
        } finally {
            await conn.close();
        }
    } catch (err) {
        console.error("Connection error:", err);
    }

    console.log("done!");
    return queryResult;
}

async function queryCarFromTable(brand, fromYear, toYear, fromPrice, toPrice, performance) {
    let sqlQuery = "SELECT * FROM Auto WHERE 1=1";

    console.log("Received manufacturer:", brand);

    if (brand) {
        sqlQuery += " AND marke = '" + brand + "'";
    }
    if (fromYear) { 
        sqlQuery += " AND baujahr >= " + fromYear;
    }
    if (toYear) { 
        sqlQuery += " AND baujahr <= " + toYear;
    }
    if (fromPrice) {
        sqlQuery += " AND preis >= " + fromPrice;
    }
    if (toPrice) { 
        sqlQuery += " AND preis <= " + toPrice;
    }
    if (performance && performance !== '0') {
        sqlQuery += " AND leistung >= '" + performance + "'"; 
    }

    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");
        console.log('Start querying with:', sqlQuery);
        var result = await conn.execute(sqlQuery); 
        await conn.close();
        console.log('done...');
        return result;
    } catch (error) {
        console.log("Connection failed! queryCarFromTable", error);
        throw error;
    }
}

//get cars by brand
async function queryCarsByBrand(brand)
{
    queryResult=null;
    await connect.connection().then(async (conn)=>{
        console.log("connection successfully established!");
        console.log('Start querying....');

        var result=await conn.execute("SELECT * FROM Auto WHERE marke = :brand",
            {brand: brand}
        );
        conn.close();
        queryResult=result;
    }).catch((error) => {
        console.log("Connection or query failed! queryCarsByBrand", error);
        return false;
    });

    console.log("done!");
    return queryResult;
}

//get reviews
async function queryReviews(userId)
{
    queryResult=null;
    await connect.connection().then(async (conn)=>{
        console.log("connection successfully established!");
        console.log('Start querying....');

        if(!userId)
            var result=await conn.execute("SELECT * FROM Review");
        else
        {
            console.log("YESSSS");
            var result=await conn.execute(
                `SELECT * FROM Review WHERE kunden_nr = :kundenNr`,
                [global.currentUser.id]);
        }
        conn.close();
        queryResult=result;
    }).catch((error) => {
        console.log("Connection or query failed! queryReviews", error);
        return false;
    });

    console.log("done!");
    return queryResult;
}

async function bookTestDrive(carId) {
    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");

        console.log('Start booking test drive...');
        const updateResult = await conn.execute(
            `UPDATE Kunde SET auto_id = :carId WHERE kunden_nr = :kundenNr`,
            [carId, global.currentUser.id]
        );
        console.log("CAR_ID, USER_ID", carId, global.currentUser.id);
        console.log('Test drive booked successfully:', updateResult);
        await conn.commit();
        await conn.close();
        return true;
    } catch (error) {
        console.log("Error in booking test drive:", error);
        return false;
    }
}

//create review
async function createReview(rating,text)
{
    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");

        console.log('Start adding review');
        const insertResult = await conn.execute(
            "INSERT INTO Review (sterne,beschreibung,kunden_nr) VALUES (:rating, :text, :userID)",
            { rating:rating, text:text, userId:global.currentUser.id}
        );
        console.log('review added yay', insertResult);
        await conn.commit();
        await conn.close();
        return true;
    } catch (error) {
        console.log("Error in booking test drive:", error);
        return false;
    }
}

async function updateReview(reviewId, rating, text) {
    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");

        console.log('Start updating review');
        const updateResult = await conn.execute(
            "UPDATE Review SET sterne = :rating, beschreibung = :text WHERE review_id = :reviewId",
            { rating, text, reviewId }
        );
        console.log('Review updated successfully:', updateResult);
        await conn.commit(); 
        await conn.close();
        return true;
    } catch (error) {
        console.error("Error in updating review:", error);
        return false;
    }
}


//delete review
async function deleteReview(reviewId) {
    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");

        console.log('Start updating review');
        const updateResult = await conn.execute(
            "DELETE FROM Review WHERE review_id = :reviewId",
            { reviewId }
        );
        console.log('Review updated successfully:', updateResult);
        await conn.commit(); 
        await conn.close(); 
        return true;
    } catch (error) {
        console.error("Error in updating review:", error);
        return false;
    }
}

async function queryTestDrive(reviewId) {
    let conn;
    try {
        conn = await connect.connection();
        console.log("Connection successfully established!");
        const carDetailsResult = await conn.execute(
            "SELECT * FROM KundeTestFahrt WHERE kunden_nr = :userId",
            [global.currentUser.id] 
        );

        console.log("Fetched Results:", carDetailsResult.rows);

        if (carDetailsResult.rows.length > 0) {
            console.log("Car Details for the user:", carDetailsResult.rows);
            return carDetailsResult.rows;
        } else {
            console.error("No car associated with this user ID:", global.currentUser.id);
            return false;
        }
    } catch (error) {
        console.error("Error in function queryTestDrive:", error);
        return null;
    } finally {
        if (conn) {
            try {
                await conn.close();
                console.log("Database connection closed");
            } catch (closeError) {
                console.error("Error closing the connection:", closeError);
            }
        }
    }
}

async function deleteTestDrive(userId)
{

    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");
        if (!userId)
            userId = global.currentUser.id;
        console.log('Start updating review');
        const updateResult = await conn.execute(
            "UPDATE Kunde SET auto_id = NULL WHERE kunden_nr = :userId",
            { userId }
        );
        console.log('test drive updated successfully:', updateResult);
        await conn.commit(); 
        await conn.close(); 
        return true;
    } catch (error) {
        console.error("Error in updating review:", error);
        return false;
    }
}

async function addCar(params) {
    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");

        console.log('Start adding car');
        const insertResult = await conn.execute(
            `INSERT INTO Auto (
                marke, modell, baujahr, preis, leistung, typ, klasse, beschreibung,
                zylinder, drehmoment, treibstoff, max_geschwindigkeit, antrieb, schaltung,
                gewicht, marke_bild, auto_bild
            ) VALUES (
                :marke, :modell, :baujahr, :preis, :leistung, :typ, :klasse, :beschreibung,
                :zylinder, :drehmoment, :treibstoff, :max_geschwindigkeit, :antrieb, :schaltung,
                :gewicht, :marke_bild, :auto_bild
            )`,
            {
                marke: params.marke,
                modell: params.modell,
                baujahr: parseInt(params.baujahr),
                preis: parseFloat(params.preis),
                leistung: params.leistung,
                typ: params.typ,
                klasse: params.klasse,
                beschreibung: params.beschreibung,
                zylinder: params.zylinder,
                drehmoment: params.drehmoment,
                treibstoff: params.treibstoff,
                max_geschwindigkeit: params.max_geschwindigkeit,
                antrieb: params.antrieb,
                schaltung: params.schaltung,
                gewicht: params.gewicht,
                marke_bild: params.marke_bild,
                auto_bild: params.auto_bild
            }
        );

        console.log('Car added successfully', insertResult);
        await conn.commit();
        await conn.close();
        return true;
    } catch (error) {
        console.log("Error in adding car:", error);
        return false;
    }
}

//manager car search
async function queryManagerCars(formData) {
    let queryResult = null;
    await connect.connection().then(async (conn) => {
        console.log("Connection successfully established!");
        console.log('Start querying....');
        

        const binds = {};
        let query = `
        SELECT * FROM Auto
        WHERE 1=1`;

        if (formData.marke) {
            query += " AND marke = :marke";
            binds.marke = formData.marke;
        }
        if (formData.modell) {
            query += " AND modell = :modell";
            binds.modell = formData.modell;
        }
        if (formData.baujahr) {
            query += " AND baujahr = :baujahr";
            binds.baujahr = parseInt(formData.baujahr);
        }
        if (formData.preis) {
            query += " AND preis = :preis";
            binds.preis = parseFloat(formData.preis);
        }
        if (formData.leistung) {
            query += " AND leistung = :leistung";
            binds.leistung = formData.leistung.toString();
        }
        if (formData.typ) {
            query += " AND typ = :typ";
            binds.typ = formData.typ;
        }
        if (formData.max_geschwindigkeit) {
            geschw = formData.max_geschwindigkeit
            query += " AND max_geschwindigkeit LIKE '%' || :max_geschwindigkeit || '%'";
            binds.max_geschwindigkeit = geschw;
        }
        if (formData.zylinder) {
            query += " AND zylinder = :zylinder";
            binds.zylinder = formData.zylinder;
        }
        if (formData.klasse) {
            query += " AND klasse = :klasse";
            binds.klasse = formData.klasse;
        }
        if (formData.drehmoment) {
            query += " AND drehmoment LIKE '%' || :drehmoment ";
            binds.drehmoment = formData.drehmoment;
        }
        if (formData.treibstoff) {
            query += " AND treibstoff = :treibstoff";
            binds.treibstoff = formData.treibstoff;
        }
        if (formData.antrieb) {
            query += " AND antrieb = :antrieb";
            binds.antrieb = formData.antrieb;
        }
        if (formData.schaltung) {
            query += " AND schaltung = :schaltung";
            binds.schaltung = formData.schaltung;
        }
        if (formData.gewicht) {
            query += " AND gewicht = :gewicht";
            binds.gewicht = formData.gewicht;
        }
        if (formData.marke_bild) {
            query += " AND marke_bild = :marke_bild";
            binds.marke_bild = formData.marke_bild;
        }
        if (formData.auto_bild) {
            query += " AND auto_bild = :auto_bild";
            binds.auto_bild = formData.auto_bild;
        }
        if (formData.beschreibung) {
            query += " AND beschreibung = :beschreibung";
            binds.beschreibung = formData.beschreibung;
        }

        console.log("QUERY: ", query);
        console.log("Binds: ", binds);
        try {
            const result = await conn.execute(query, binds);
            console.log("Number of cars returned:", result.rows.length);
            queryResult = result;
        } catch (error) {
            console.log("Query execution failed: ", error);
        }

        await conn.close();
    }).catch((error) => {
        console.log("Failed queryManagerCars", error);
        return false;
    });

    console.log("done!");
    return queryResult;
}

async function updateCar(carData) {
    try {
        conn = await connect.connection(); 
        const query = `
            UPDATE Auto
            SET marke = :1,
                modell = :2,
                baujahr = :3,
                preis = :4,
                leistung = :5,
                typ = :6,
                klasse = :7,
                zylinder = :8,
                drehmoment = :9,
                treibstoff = :10,
                max_geschwindigkeit = :11,
                antrieb = :12,
                schaltung = :13,
                gewicht = :14,
                marke_bild = :15,
                auto_bild = :16
            WHERE auto_id = :17
        `;

        const values = [
            carData.marke,
            carData.modell,
            parseInt(carData.baujahr),
            parseFloat(carData.preis),
            carData.leistung,         
            carData.typ,              
            carData.klasse,           
            carData.zylinder,          
            carData.drehmoment,        
            carData.treibstoff,        
            carData.max_geschwindigkeit,
            carData.antrieb,           
            carData.schaltung,         
            carData.gewicht,           
            carData.marke_bild,        
            carData.auto_bild,         
            parseInt(carData.id)       
        ];

        console.log('Executing query with values:', values);
        const res = await conn.execute(query, values);
        console.log('Car updated successfully:', res);

        await conn.commit();
        return true;
    } catch (err) {
        console.error('Error executing query:', err);
        if (conn) {
            await conn.rollback();
            console.error('idk.....');
        }
        return false;
    } finally {
        if (conn) {
            await conn.close();
            console.log('Database connection closed.');
        }
    }
}

async function deleteCar(id)
{
    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");
        console.log('Start deleting car');
        const updateResult = await conn.execute(
            "DELETE FROM Auto WHERE auto_id = :id",
            { id }
        );
        console.log('auto removed succesfully:', updateResult);
        await conn.commit(); 
        await conn.close(); 
        return true;
    } catch (error) {
        console.error("Error in deleting car:", error);
        return false;
    }
}

async function carStatistics() {
    let queryResult = null;
    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");

        const result = await conn.execute(`
            SELECT * FROM AutoStatistik
        `);
        
        await conn.close();
        queryResult = result.rows;
    } catch (error) {
        console.error("Error fetching car statistics:", error);
    }
    return queryResult;
}


async function transactionStatistics() {
    let queryResult = null;
    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");

        const result = await conn.execute(`
            SELECT * FROM TransaktionStatistik
        `);
        
        await conn.close();
        queryResult = result.rows[0];
        console.log("Transaction statistics fetched successfully:", queryResult);
    } catch (error) {
        console.error("Error fetching transaction statistics:", error);
    }
    return queryResult;
}

async function userStatistics() {
    let queryResult = null;
    try {
        const conn = await connect.connection();
        console.log("Connection successfully established!");

        const result = await conn.execute(`
            SELECT 
                (SELECT COUNT(*) FROM Kunde) AS total_customers,
                (SELECT COUNT(*) FROM Mitarbeiter) AS total_employees
            FROM dual
        `);

        await conn.close();
        queryResult = {
            total_customers: result.rows[0][0],
            total_employees: result.rows[0][1],
            total_users: result.rows[0][0] + result.rows[0][1]
        };
        console.log("User statistics fetched successfully:", queryResult);
    } catch (error) {
        console.error("Error fetching user statistics:", error);
    }
    return queryResult;
}

async function getTransactions() {
    const conn = await connect.connection();
    try {
        const result = await conn.execute('SELECT * FROM TransaktionView');
        return result.rows;
    } finally {
        await conn.close();
    }
}

async function getTestDrives(){
    const conn = await connect.connection();
    try
    {
        const res = await conn.execute('SELECT * FROM AlleTestFahrten')
        if (res)
        {
            return res;
        }
        else
        {
            console.log("no testdrives found");
            return res;
        }
    }
    catch(error)
    {
        console.log("Query alltestdrives failed:",error)
    }
    finally
    {
        await conn.close();
    }
    return res;
}

// get all beliefert entries with procedure 
async function getBeliefert() {
    const conn = await connect.connection();
    try {
        const auto_ids = await getAutoIds();
        console.log("AUTO ID's", auto_ids);

        const beliefertData = [];

        for (const auto_id of auto_ids) {
            const bindVars = {
                p_auto_id: auto_id,
                p_auto_modell: { dir: connect.oracledb.BIND_OUT, type: connect.oracledb.STRING, maxSize: 200 },
                p_fabrik_id: { dir: connect.oracledb.BIND_OUT, type: connect.oracledb.NUMBER },
                p_fabrik_name: { dir: connect.oracledb.BIND_OUT, type: connect.oracledb.STRING, maxSize: 200 },
                p_standort: { dir: connect.oracledb.BIND_OUT, type: connect.oracledb.STRING, maxSize: 200 },
                p_autoteil_id: { dir: connect.oracledb.BIND_OUT, type: connect.oracledb.NUMBER },
                p_preis: { dir: connect.oracledb.BIND_OUT, type: connect.oracledb.NUMBER }
            };

            const result = await conn.execute(
                `BEGIN BeliefertProcedure(:p_auto_id, :p_auto_modell, :p_fabrik_id, :p_fabrik_name, :p_standort, :p_autoteil_id, :p_preis); END;`,
                bindVars
            );

            beliefertData.push({
                auto_id,
                auto_modell: result.outBinds.p_auto_modell,
                fabrik_id: result.outBinds.p_fabrik_id,
                fabrik_name: result.outBinds.p_fabrik_name,
                standort: result.outBinds.p_standort,
                autoteil_id: result.outBinds.p_autoteil_id,
                preis: result.outBinds.p_preis
            });
        }

        console.log("QUERY RESULT", beliefertData);
        return beliefertData;
    } catch (error) {
        console.error("Error fetching beliefert data:", error);
        throw error;
    } finally {
        await conn.close();
    }
}



//get car id in beliefert
async function getAutoIds() {
    const conn = await connect.connection();
    try {
        const autoIdsResult = await conn.execute("SELECT DISTINCT auto_id FROM Beliefert");
        return autoIdsResult.rows.map(row => row[0]);
    } finally {
        await conn.close();
    }
}

async function buyCar(carId, userId) {
    try {
        conn = await connect.connection();
        console.log("Connection successfully established!");

        const employeeResult = await conn.execute(
            `SELECT mitarbeiter_nr FROM (
                SELECT mitarbeiter_nr FROM Mitarbeiter
                ORDER BY DBMS_RANDOM.VALUE
            ) WHERE ROWNUM = 1`
        );
        
        const employeeId = employeeResult.rows[0][0];
        const insertTransaction = `
            INSERT INTO Transaktion (transaktions_id, auto_nr, kunden_nr, mitarbeiter_nr)
            VALUES (transaktion_id_seq.NEXTVAL, :auto_nr, :kunden_nr, :mitarbeiter_nr)
        `;
        console.log(carId, userId,employeeId )
        await conn.execute(insertTransaction, 
            {auto_nr: carId,kunden_nr: userId,mitarbeiter_nr: employeeId});
        await conn.commit();
        console.log("CAR PURCHASED SUCCESFULLY YAY");
        return true;

    } catch (error) {
        console.error('Error buying car:', error);
        return false;
    } finally {
        await conn.close();
    }
}

async function getCustomerTransactions(userId) {
    console.log("QUERYING");
    let conn;
    try {
        conn = await connect.connection();
        console.log("Connection established for querying transactions");

        const query = `
            SELECT 
                transaktions_id,
                auto_id,
                modell,
                umsatz,
                mitarbeiter_nr,
                mitarbeiter_nachname,
                kunden_nr,
                kunden_nachname
            FROM 
                TransaktionView 
            WHERE 
                kunden_nr = :customerId`;

        const result = await conn.execute(query, [userId]);
        console.log("Results from transaction query: ", result);
        await conn.close();
        return result.rows;

    } catch (error) {
        console.error('Error fetching customer transactions:', error);
        if (conn) {
            await conn.close();
        }
        throw error;
    }
}

module.exports.getCustomerTransactions=getCustomerTransactions;
module.exports.buyCar=buyCar;
module.exports.getBeliefert = getBeliefert;
module.exports.getTestDrives=getTestDrives;
module.exports.getTransactions = getTransactions;
module.exports.carStatistics = carStatistics;
module.exports.transactionStatistics = transactionStatistics;
module.exports.userStatistics = userStatistics;
module.exports.deleteCar=deleteCar;
module.exports.updateCar=updateCar;
module.exports.queryManagerCars=queryManagerCars;
module.exports.addCar=addCar;
module.exports.deleteTestDrive=deleteTestDrive;
module.exports.queryTestDrive=queryTestDrive;
module.exports.deleteReview=deleteReview;
module.exports.updateReview=updateReview;
module.exports.createReview=createReview;
module.exports.bookTestDrive=bookTestDrive;
module.exports.queryReviews=queryReviews;
module.exports.queryCarsByBrand=queryCarsByBrand;
module.exports.queryCarFromTable=queryCarFromTable;
module.exports.registerEmployee=registerEmployee;
module.exports.registerCustomer=registerCustomer;
module.exports.checkPassword=checkPassword;
module.exports.inserDataToTable=inserDataToTable;
module.exports.queryDataFromTable=queryDataFromTable;
module.exports.callStoredProcedure=callStoredProcedure;