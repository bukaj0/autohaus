CREATE SEQUENCE auto_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE kunden_nr_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE mitarbeiter_nr_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE transaktion_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE fabrik_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE autoteil_id_seq START WITH 1 INCREMENT BY 1;


-- Auto Table
CREATE TABLE Auto (
    auto_id INTEGER PRIMARY KEY NOT NULL,
    marke VARCHAR2(255) DEFAULT 'Unknown',
    modell VARCHAR2(255) DEFAULT 'Unknown',
    baujahr INTEGER NOT NULL,
    preis NUMBER(10,2) NOT NULL,
    leistung VARCHAR2(255) DEFAULT 'Unknown',
    typ VARCHAR2(255) DEFAULT 'Unknown',
    klasse VARCHAR2(255) DEFAULT 'Unknown',
    beschreibung VARCHAR(4000) DEFAULT 'No Description Available',
    zylinder VARCHAR2(255) DEFAULT 'Unknown',
    drehmoment VARCHAR2(255) DEFAULT 'Unknown',
    treibstoff VARCHAR2(255) DEFAULT 'Unknown',
    max_geschwindigkeit VARCHAR2(255) DEFAULT 'Unknown',
    antrieb VARCHAR2(255) DEFAULT 'Unknown',
    schaltung VARCHAR2(255) DEFAULT 'Unknown',
    gewicht VARCHAR2(255) DEFAULT 'Unknown',
    marke_bild VARCHAR2(4000),
    auto_bild VARCHAR2(4000)
);

-- Trigger for Auto
CREATE OR REPLACE TRIGGER auto_id_trigger
BEFORE INSERT ON Auto
FOR EACH ROW
WHEN (NEW.auto_id IS NULL)
BEGIN
    SELECT auto_id_seq.NEXTVAL INTO :NEW.auto_id FROM dual;
END;
/

-- Kunde Table
CREATE TABLE Kunde (
    kunden_nr INTEGER PRIMARY KEY,
    vorname VARCHAR2(255) NOT NULL,
    nachname VARCHAR2(255) NOT NULL,
    email VARCHAR2(320) NOT NULL,
    pwd VARCHAR2(320) NOT NULL,
    auto_id INTEGER,
    ref_kunden_nr INTEGER,
    FOREIGN KEY (auto_id) REFERENCES Auto(auto_id) ON DELETE SET NULL,
    FOREIGN KEY (ref_kunden_nr) REFERENCES Kunde(kunden_nr) ON DELETE SET NULL
);

-- Trigger for Kunde
CREATE OR REPLACE TRIGGER kunden_nr_trigger
BEFORE INSERT ON Kunde
FOR EACH ROW
WHEN (NEW.kunden_nr IS NULL)
BEGIN
  SELECT kunden_nr_seq.NEXTVAL INTO :NEW.kunden_nr FROM dual;
END;
/

-- Review Table
CREATE TABLE Review (
    review_id INTEGER GENERATED BY DEFAULT AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
    sterne INTEGER CHECK (sterne BETWEEN 1 AND 5),
    beschreibung VARCHAR2(4000),
    kunden_nr INTEGER NOT NULL,
    FOREIGN KEY (kunden_nr) REFERENCES Kunde(kunden_nr) ON DELETE CASCADE
);

-- Leasing_Auto Table (IS-A relationship)
CREATE TABLE Leasing_Auto (
    leasing_auto_id INTEGER PRIMARY KEY,
    leasing_dauer INTEGER CHECK (leasing_dauer > 0),
    uebernahme_preis NUMBER(10,2) CHECK (uebernahme_preis >= 0),
    FOREIGN KEY (leasing_auto_id) REFERENCES Auto(auto_id) ON DELETE CASCADE
);

-- Firmenauto Table (IS-A relationship)
CREATE TABLE Firmen_auto (
    firmen_auto_id INTEGER PRIMARY KEY,
    zuweisungs_datum DATE DEFAULT CURRENT_DATE NOT NULL,
    rueckgabe_datum DATE,
    FOREIGN KEY (firmen_auto_id) REFERENCES Auto(auto_id) ON DELETE CASCADE,
    CONSTRAINT chk_rueckgabe CHECK (rueckgabe_datum >= zuweisungs_datum OR rueckgabe_datum IS NULL)
);

-- Fabrik Table
CREATE TABLE Fabrik (
    fabrik_id INTEGER PRIMARY KEY,
    fabrik_name VARCHAR(255) NOT NULL,
    standort VARCHAR2(255) NOT NULL
);

--fabrik trigger
CREATE OR REPLACE TRIGGER fabrik_id_trigger
BEFORE INSERT ON Fabrik
FOR EACH ROW
WHEN (NEW.fabrik_id IS NULL)
BEGIN
    SELECT fabrik_id_seq.NEXTVAL INTO :NEW.fabrik_id FROM dual;
END;
/

-- Autoteil Table
CREATE TABLE Autoteil (
    autoteil_id INTEGER PRIMARY KEY,
    autoteil_name VARCHAR(255),
    preis NUMBER(10,2) CHECK (preis >= 0)
);

CREATE OR REPLACE TRIGGER autoteil_id_trigger
BEFORE INSERT ON Autoteil
FOR EACH ROW
WHEN (NEW.autoteil_id IS NULL)
BEGIN
    SELECT autoteil_id_seq.NEXTVAL
    INTO :NEW.autoteil_id
    FROM dual;
END;
/
-- Mitarbeiter Table
CREATE TABLE Mitarbeiter (
    mitarbeiter_nr INTEGER NOT NULL PRIMARY KEY,
    vorname VARCHAR2(255) NOT NULL,
    nachname VARCHAR2(255) NOT NULL,
    email VARCHAR2(320) NOT NULL,
    pwd VARCHAR2(320) NOT NULL,
    eintrittsdatum DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Trigger for Mitarbeiter
CREATE OR REPLACE TRIGGER mitarbeiter_nr_trigger
BEFORE INSERT ON Mitarbeiter
FOR EACH ROW
WHEN (NEW.mitarbeiter_nr IS NULL)
BEGIN
    SELECT mitarbeiter_nr_seq.NEXTVAL INTO :NEW.mitarbeiter_nr FROM dual;
END;
/

-- Transaktion Table
CREATE TABLE Transaktion (
    transaktions_id INTEGER,
    auto_nr INTEGER,
    umsatz NUMBER(10,2) CHECK (umsatz >= 0),
    kunden_nr INTEGER,
    mitarbeiter_nr INTEGER,
    PRIMARY KEY (transaktions_id, auto_nr) ,
    FOREIGN KEY (auto_nr) REFERENCES Auto(auto_id) ON DELETE CASCADE,
    FOREIGN KEY (kunden_nr) REFERENCES Kunde(kunden_nr),
    FOREIGN KEY (mitarbeiter_nr) REFERENCES Mitarbeiter(mitarbeiter_nr)
);

-- Transaktions umsatz
CREATE OR REPLACE TRIGGER TransaktionsUmsatz
BEFORE INSERT ON Transaktion
FOR EACH ROW
BEGIN
    SELECT preis
    FROM Auto
    WHERE auto_id = :NEW.auto_nr;
END;
/

-- Beliefert
CREATE TABLE Beliefert (
    auto_id INTEGER,
    fabrik_id INTEGER,
    autoteil_id INTEGER,
    FOREIGN KEY (auto_id) REFERENCES Auto(auto_id) ON DELETE CASCADE,
    FOREIGN KEY (fabrik_id) REFERENCES Fabrik(fabrik_id),
    FOREIGN KEY (autoteil_id) REFERENCES Autoteil(autoteil_id),
    PRIMARY KEY (auto_id, fabrik_id, autoteil_id)
);


-- View fuer test Fahrt
CREATE VIEW KundenTestFahrt AS
SELECT 
    k.kunden_nr,
    a.auto_id,
    a.marke,
    a.modell,
    a.baujahr,
    a.preis,
    a.leistung,
    a.typ,
    a.auto_bild
FROM Kunde k
JOIN Auto a ON k.auto_id = a.auto_id;


-- view fuer auto statistik 
CREATE VIEW AutoStatistik AS
SELECT 
    marke,
    COUNT(auto_id) AS total_cars
FROM Auto
GROUP BY marke
HAVING COUNT(auto_id) > 0;

-- transaktionen statistik
CREATE VIEW TransaktionStatistik AS
SELECT 
    COUNT(transaktions_id) AS total_transactions,
    AVG(umsatz) AS average_transaction_cost
FROM Transaktion;

-- Trigger fuer Transaktion
CREATE OR REPLACE TRIGGER transaktion_id_trigger
BEFORE INSERT ON Transaktion
FOR EACH ROW
WHEN (NEW.transaktions_id IS NULL)
BEGIN
    SELECT transaktion_id_seq.NEXTVAL INTO :NEW.transaktions_id FROM dual;
END;
/

-- Create View
CREATE VIEW TransaktionView AS
SELECT 
    t.transaktions_id,
    a.auto_id,
    a.modell,
    t.umsatz,
    m.mitarbeiter_nr,
    m.nachname AS mitarbeiter_nachname,
    k.kunden_nr,
    k.nachname AS kunden_nachname
FROM 
    Transaktion t
JOIN 
    Auto a ON t.auto_nr = a.auto_id
JOIN 
    Mitarbeiter m ON t.mitarbeiter_nr = m.mitarbeiter_nr
JOIN 
    Kunde k ON t.kunden_nr = k.kunden_nr;

CREATE VIEW AlleTestFahrten AS
SELECT 
    k.kunden_nr,
    k.nachname,
    k.email,
    a.auto_id ,
    a.modell,
    a.preis,
    a.typ,
    a.auto_bild
FROM 
    Kunde k
INNER JOIN 
    Auto a ON k.auto_id = a.auto_id
WHERE 
    k.auto_id IS NOT NULL;


-- Procedure fuer Ternaere Beziehung
CREATE OR REPLACE PROCEDURE BeliefertProcedure (
    p_auto_id       IN  INTEGER,
    p_auto_modell   OUT VARCHAR2,
    p_fabrik_id     OUT INTEGER,
    p_fabrik_name   OUT VARCHAR2,
    p_standort      OUT VARCHAR2,
    p_autoteil_id   OUT INTEGER,
    p_preis         OUT NUMBER
) AS
BEGIN
    SELECT b.fabrik_id, b.autoteil_id, at.preis, f.fabrik_name, f.standort, a.modell
    INTO p_fabrik_id, p_autoteil_id, p_preis, p_fabrik_name, p_standort, p_auto_modell
    FROM Beliefert b
    JOIN Autoteil at ON b.autoteil_id = at.autoteil_id
    JOIN Fabrik f ON b.fabrik_id = f.fabrik_id
    JOIN Auto a ON b.auto_id = a.auto_id
    WHERE b.auto_id = p_auto_id;
END;
/
