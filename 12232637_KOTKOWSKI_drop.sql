
DROP VIEW KundenTestFahrt;
DROP VIEW AutoStatistik;
DROP VIEW TransaktionStatistik;
DROP VIEW TransaktionView;
DROP VIEW AlleTestFahrten;
DROP PROCEDURE BeliefertProcedure;

DROP TRIGGER auto_id_trigger;
DROP TRIGGER kunden_nr_trigger;
DROP TRIGGER mitarbeiter_nr_trigger;
DROP TRIGGER TransaktionsUmsatz;
DROP TRIGGER autoteil_id_trigger;
DROP TRIGGER fabrik_id_trigger;
DROP TRIGGER transaktion_id_trigger;

DROP TABLE Beliefert;
DROP TABLE Transaktion;
DROP TABLE Firmen_auto;
DROP TABLE Leasing_Auto;
DROP TABLE Review;
DROP TABLE Kunde;
DROP TABLE Auto;
DROP TABLE Fabrik;
DROP TABLE Autoteil;
DROP TABLE Mitarbeiter;

DROP SEQUENCE auto_id_seq;
DROP SEQUENCE kunden_nr_seq;
DROP SEQUENCE mitarbeiter_nr_seq;
DROP SEQUENCE transaktion_id_seq;
DROP SEQUENCE fabrik_id_seq;
DROP SEQUENCE autoteil_id_seq;
