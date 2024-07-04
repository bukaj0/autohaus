import oracledb
import re
import pandas as pd
import random
from faker import Faker
from datetime import datetime, timedelta 

un = 'a12232637'
cs = 'oracle19.cs.univie.ac.at:1521/orclcdb'
pw = 'dbs24'

fake = Faker()

def insertMitarbeiter(cursor):
    for _ in range(100):
        vorname = fake.first_name()
        nachname = fake.last_name()
        email = fake.email()
        pwd = fake.password(length=12)
        eintrittsdatum = fake.date_between(start_date='-10y', end_date='today')
        
        try:
            cursor.execute(
                """
                INSERT INTO Mitarbeiter (vorname, nachname, email, pwd, eintrittsdatum)
                VALUES (:1, :2, :3, :4, :5)
                """,
                (vorname, nachname, email, pwd, eintrittsdatum)
            )
        except Exception as e:
            print(f"Error inserting employee data: {e}")

def insertKunde(cursor):
    for _ in range(1010):
        vorname = fake.first_name()
        nachname = fake.last_name()
        email = fake.email()
        pwd = fake.password(length=12)
        
        try:
            cursor.execute(
                """
                INSERT INTO Kunde (vorname, nachname, email, pwd)
                VALUES (:1, :2, :3, :4)
                """,
                (vorname, nachname, email, pwd)
            )
        except Exception as e:
            print(f"Error inserting customer data: {e}")

def insertLeasingAuto(cursor):
    cursor.execute("SELECT auto_id FROM Auto WHERE auto_id NOT IN (SELECT leasing_auto_id FROM Leasing_Auto)")
    auto_ids = [row[0] for row in cursor.fetchall()]

    leasing_ids = random.sample(auto_ids, min(100, len(auto_ids)))
    
    for auto_id in leasing_ids:
        leasing_dauer = random.choice([12, 24, 36, 48]) 
        uebernahme_preis = random.uniform(1000, 5000)

        try:
            cursor.execute(
                """
                INSERT INTO Leasing_Auto (leasing_auto_id, leasing_dauer, uebernahme_preis)
                VALUES (:1, :2, :3)
                """,
                (auto_id, leasing_dauer, uebernahme_preis)
            )
        except Exception as e:
            print(f"Error inserting leasing data for auto_id {auto_id}: {e}")


def insertFirmenAuto(cursor):
    cursor.execute("SELECT auto_id FROM Auto WHERE auto_id NOT IN (SELECT firmen_auto_id FROM Firmen_auto)")
    auto_ids = [row[0] for row in cursor.fetchall()]

    selected_auto_ids = random.sample(auto_ids, 100)
    
    for auto_id in selected_auto_ids:
        zuweisungs_datum = fake.date_between(start_date='-5y', end_date='today')
        days_after = random.randint(365, 365 * 3)
        rueckgabe_datum = zuweisungs_datum + timedelta(days=days_after)
        
        try:
            cursor.execute(
                """
                INSERT INTO Firmen_auto (firmen_auto_id, zuweisungs_datum, rueckgabe_datum)
                VALUES (:1, TO_DATE(:2, 'YYYY-MM-DD'), TO_DATE(:3, 'YYYY-MM-DD'))
                """,
                (auto_id, zuweisungs_datum.strftime('%Y-%m-%d'), rueckgabe_datum.strftime('%Y-%m-%d'))
            )
        except Exception as e:
            print(f"Error inserting firm car data for auto_id {auto_id}: {e}")

def extract_hp(power_str):
    match = re.search(r'(\d+)\s*HP', power_str)
    if match:
        return match.group(1) + " PS"
    else:
        return "Unknown PS"
    
def extract_kmh(speed_str):
    match = re.search(r'(\d+)\s*km/h', speed_str)
    if match:
        return match.group(1) + " km/h"
    else:
        return "Unknown km/h"

def insertCar(cursor):
    car_data = pd.read_csv("csv/data_full.csv", sep=",", on_bad_lines='skip')
    print(car_data.head())
    print(car_data.dtypes)

    car_data = car_data.astype(str)

    car_data['preis'] = car_data.apply(lambda x: f"{random.uniform(5000, 80000):.2f}", axis=1)
    car_data['power'] = car_data['power'].apply(extract_hp)
    car_data['top_speed'] = car_data['top_speed'].apply(extract_kmh)
    for index, row in car_data.iterrows():
        print("inserting car number: ",index)
        brand_logo_url = row['brand_logo_url']
        auto_bild = row['image_urls'][:4000].split(',')[0].strip()
        try:
            cursor.execute(
                """
                INSERT INTO Auto (marke, modell, baujahr, preis, leistung, typ, klasse, beschreibung, zylinder, drehmoment, treibstoff, max_geschwindigkeit, antrieb, schaltung, gewicht, marke_bild, auto_bild)
                VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14, :15, :16, :17)
                """,
                (
                    row['brand'], row['model'], row['from_year'], row['preis'], row['power'], 
                    row['body_style'], row['segment'], row['description'], row['cylinders'], row['torque'], 
                    row['fuel'], row['top_speed'], row['drive_type'], row['gearbox'], 
                    row['gross_weight_limit'], brand_logo_url, auto_bild
                )
            )
        except Exception as e:
            print(f"Error inserting row {index}: {e}")
            print(f"Row data: {row}")
    print("Data inserted successfully")

def insertReview(cursor):
    cursor.execute("SELECT kunden_nr FROM Kunde")
    customer_ids = [row[0] for row in cursor.fetchall()]
    
    for _ in range(50):
        sterne = random.randint(1, 5)
        beschreibung = fake.text(max_nb_chars=200)
        kunden_nr = random.choice(customer_ids)
        
        try:
            cursor.execute(
                """
                INSERT INTO Review (sterne, beschreibung, kunden_nr)
                VALUES (:1, :2, :3)
                """,
                (sterne, beschreibung, kunden_nr)
            )
        except Exception as e:
            print(f"Error inserting review data: {e}")

def insertDebugObjects(cursor):
    cursor.execute(
        """
        INSERT INTO Kunde (kunden_nr, vorname, nachname, email, pwd, auto_id, ref_kunden_nr)
        VALUES (:1, :2, :3, :4, :5, :6, :7)
        """,
        (1001, 'John', 'TestKunde', 'test@customer.com', 'pwd', 1, 1)
    )

    cursor.execute(
        """
        INSERT INTO Mitarbeiter (mitarbeiter_nr, vorname, nachname, email, pwd, eintrittsdatum)
        VALUES (:1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD'))
        """,
        (9991, 'Steven', 'TestKunde', 'test@employee.com', 'pwd', '2024-06-20') 
    )

    cursor.execute(
        """
        INSERT INTO Kunde (kunden_nr, vorname, nachname, email, pwd)
        VALUES (:1, :2, :3, :4, :5)
        """,
        (999, 'Test', 'User', 'test@test.com', 'pwd')
    )

    cursor.execute(
        """
        INSERT INTO Review (review_id, sterne, beschreibung, kunden_nr)
        VALUES (:1, :2, :3, :4)
        """,
        (10101010, 2, 'AAA FUNNY CAR', 1001)
    )

def insertTransaktion(cursor):
    cursor.execute("SELECT kunden_nr FROM Kunde")
    customer_ids = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT auto_id FROM Auto")
    car_ids = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT mitarbeiter_nr FROM Mitarbeiter")
    employee_ids = [row[0] for row in cursor.fetchall()]

    for _ in range(10):
        auto_nr = random.choice(car_ids)
        kunden_nr = random.choice(customer_ids)
        mitarbeiter_nr = random.choice(employee_ids)

        try:
            cursor.execute(
                """
                INSERT INTO Transaktion (auto_nr, kunden_nr, mitarbeiter_nr)
                VALUES (:1, :2, :3)
                """,
                (auto_nr, kunden_nr, mitarbeiter_nr)
            )
        except Exception as e:
            print(f"Error inserting transaction data: {e}")


def insertTestfahrten(cursor):
    cursor.execute("SELECT kunden_nr FROM Kunde")
    customer_ids = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT auto_id FROM Auto")
    car_ids = [row[0] for row in cursor.fetchall()]

    for _ in range(20):
        auto_id = random.choice(car_ids)
        kunden_nr = random.choice(customer_ids)

        try:
            cursor.execute(
                """
                UPDATE Kunde
                SET auto_id = :1
                WHERE kunden_nr = :2
                """,
                (auto_id, kunden_nr)
            )
        except Exception as e:
            print(f"Error inserting test drive data: {e}")

def insertFabriken(cursor):
    for _ in range(50):
        fabrik_name = fake.company()
        standort = fake.city()

        try:
            cursor.execute(
                """
                INSERT INTO Fabrik (fabrik_name, standort)
                VALUES (:1, :2)
                """,
                (fabrik_name, standort)
            )
        except Exception as e:
            print(f"Error inserting factory data: {e}")

def insertAutoteil(cursor):
    for _ in range(50):
        autoteil_name = fake.word()
        preis = random.uniform(50, 1000)

        try:
            cursor.execute(
                """
                INSERT INTO Autoteil (autoteil_name, preis)
                VALUES (:1, :2)
                """,
                (autoteil_name, preis)
            )
        except Exception as e:
            print(f"Error inserting autoteil data: {e}")

def insertBeliefert(cursor):
    cursor.execute("SELECT auto_id FROM Auto")
    auto_ids = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT fabrik_id FROM Fabrik")
    fabrik_ids = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT autoteil_id FROM Autoteil")
    autoteil_ids = [row[0] for row in cursor.fetchall()]

    for _ in range(10):
        auto_id = random.choice(auto_ids)
        fabrik_id = random.choice(fabrik_ids)
        autoteil_id = random.choice(autoteil_ids)

        try:
            cursor.execute(
                """
                INSERT INTO Beliefert (auto_id, fabrik_id, autoteil_id)
                VALUES (:1, :2, :3)
                """,
                (auto_id, fabrik_id, autoteil_id)
            )
        except Exception as e:
            print(f"Error inserting beliefert data: {e}")

with oracledb.connect(user=un, password=pw, dsn=cs) as connection:
    with connection.cursor() as cursor:
        sql = """select sysdate from dual"""
        for r in cursor.execute(sql):
            print(r)
        
        cursor.execute('SELECT * FROM Kunde')
        res = cursor.fetchall()
        for row in res:
            print(row)

        insertCar(cursor)
        insertLeasingAuto(cursor)
        insertFirmenAuto(cursor)
        insertMitarbeiter(cursor)
        insertKunde(cursor)
        insertReview(cursor)
        insertDebugObjects(cursor)
        insertTransaktion(cursor)
        insertTestfahrten(cursor)
        insertFabriken(cursor)
        insertAutoteil(cursor)
        insertBeliefert(cursor)
        connection.commit()
