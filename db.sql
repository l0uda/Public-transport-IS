CREATE TABLE `Conveyor` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `passwd` VARCHAR(100) NOT NULL,
  `firm` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC));
  
CREATE TABLE `Stop` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `conveyorID` INT UNSIGNED NOT NULL,
  `confirmed` BOOL DEFAULT FALSE,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`conveyorID`) REFERENCES `Conveyor`(`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC));

CREATE TABLE `Vehicle` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `max_seats_poor` INT NOT NULL,
  `max_seats_rich` INT NOT NULL,
  `description` VARCHAR(100) NULL,
  `last_visited` INT(10) NULL DEFAULT NULL,
  `conveyorID` INT(10) UNSIGNED NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`conveyorID`) REFERENCES `Conveyor`(`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC));

CREATE TABLE `Connection` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `conveyorID` INT(10) UNSIGNED,
  `vehicleID` INT UNSIGNED,
  `price_poor` INT UNSIGNED NOT NULL,
  `price_rich` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`conveyorID`) REFERENCES `Conveyor`(`ID`),
  FOREIGN KEY (`vehicleID`) REFERENCES `Vehicle`(`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC));

CREATE TABLE `Connection_stop` (
  `connID` INT NOT NULL,
  `stopID` INT UNSIGNED NOT NULL,
  `arrival` TIME NOT NULL,
  FOREIGN KEY (`connID`) REFERENCES `Connection`(`ID`),
  FOREIGN KEY (`stopID`) REFERENCES `Stop`(`ID`)
);

CREATE TABLE `Vehicle_seat` (
  `vehicleID` INT UNSIGNED NOT NULL,
  `seat` INT UNSIGNED NOT NULL,
  `class` INT UNSIGNED NOT NULL,
  `free` BOOL DEFAULT TRUE,
  FOREIGN KEY (`vehicleID`) REFERENCES `Vehicle`(`ID`)
);

CREATE TABLE `Crew` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conveyorID` INT UNSIGNED NOT NULL,
  `passwd` VARCHAR(100) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`conveyorID`) REFERENCES `Conveyor`(`ID`)
);

 CREATE TABLE `Admin` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `passwd` VARCHAR(100) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ID`)
);

CREATE TABLE `Passenger` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `passwd` VARCHAR(100) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `email` VARCHAR(100) NULL,
  `registered` BOOL NOT NULL,
  PRIMARY KEY (`ID`)
);

CREATE TABLE `Reservation` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `connectionID` INT NOT NULL,
  `passengerID` INT UNSIGNED NOT NULL,
  `paid` BOOL,
  `cost` INT UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`connectionID`) REFERENCES `Connection`(`ID`),
  FOREIGN KEY (`passengerID`) REFERENCES `Passenger`(`ID`)
);

CREATE TABLE `Reservation_seat` (
  `reservationID` INT UNSIGNED NOT NULL,
  `seat` INT UNSIGNED,
  FOREIGN KEY (`reservationID`) REFERENCES `Reservation`(`ID`)
);

 INSERT INTO Conveyor (passwd,firm) VALUES("awdawd","SimoniJezdi S.R.O");
 INSERT INTO Conveyor (passwd,firm) VALUES("aaaaa","RYCHLE JED"); 
 INSERT INTO Conveyor (passwd,firm) VALUES("awdawd","speedy gonzales"); 
 INSERT INTO Conveyor (passwd,firm) VALUES("awdawd","dej mi vic Enterprise"); 

 INSERT INTO Stop VALUES(1,"Zahrebska",1,TRUE);
 INSERT INTO Stop VALUES(2,"Honzova",1,TRUE); 
 INSERT INTO Stop VALUES(3,"Zahradnicka",2,TRUE); 
 INSERT INTO Stop VALUES(4,"Simonova",3,TRUE);
 INSERT INTO Stop VALUES(5,"Pepova",3,FALSE);

 INSERT INTO Vehicle (max_seats_poor,max_seats_rich,description,last_visited,conveyorID)
 VALUES (1,2,"Standardni vuz",1,1);
 
 INSERT INTO Vehicle (max_seats_poor,max_seats_rich,description,last_visited,conveyorID)
 VALUES (3,0,"Novy, super, ultra rychly transporter",2,2);
 
 INSERT INTO Vehicle (max_seats_poor,max_seats_rich,description,last_visited,conveyorID)
 VALUES (1,11,"stara rachotina z nemecka, kvalita slusna",3,3);
 
 INSERT INTO Connection (ID,conveyorID,vehicleID,price_poor,price_rich) VALUES (100,1,1,5,50);
 INSERT INTO Connection (ID,conveyorID,vehicleID,price_poor,price_rich) VALUES (101,2,2,2,45);
 INSERT INTO Connection (ID,conveyorID,vehicleID,price_poor,price_rich) VALUES (102,3,3,1,514);
 
 INSERT INTO Connection_stop (connID,stopID,arrival) VALUES (101,1,"06:24:00");
 INSERT INTO Connection_stop (connID,stopID,arrival) VALUES (101,2,"06:25:00"); 
 INSERT INTO Connection_stop (connID,stopID,arrival) VALUES (101,4,"08:22:00"); 
 
 INSERT INTO Connection_stop (connID,stopID,arrival) VALUES (102,4,"06:24:00"); 
 INSERT INTO Connection_stop (connID,stopID,arrival) VALUES (102,3,"08:24:00"); 
 INSERT INTO Connection_stop (connID,stopID,arrival) VALUES (102,2,"13:24:00"); 
 
 INSERT INTO Connection_stop (connID,stopID,arrival) VALUES (100,2,"13:24:00"); 
 INSERT INTO Connection_stop (connID,stopID,arrival) VALUES (100,1,"16:34:00"); 
 INSERT INTO Connection_stop (connID,stopID,arrival) VALUES (100,4,"23:11:00"); 

 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (1,0,1,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (1,1,1,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (1,2,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (1,3,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (1,4,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (1,5,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (1,6,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (1,7,1,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (1,8,1,TRUE); 


 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,0,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,1,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,2,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,3,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,4,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,5,2,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,6,1,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,7,1,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,8,1,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,9,1,TRUE); 
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (2,10,1,TRUE); 

 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,1,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,2,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,3,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,4,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,5,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,6,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,7,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,8,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,9,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,10,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,11,1,1);
 INSERT INTO Vehicle_seat (vehicleID,seat,class,free) VALUES (3,12,2,1);
 
 INSERT INTO Crew (ID,conveyorID,passwd,name) VALUES (1,1,"personal","Michal Dvořák");
 INSERT INTO Crew (ID,conveyorID,passwd,name) VALUES (2,2,"personal","Petr Straka");
   
 INSERT INTO Crew (ID,conveyorID,passwd,name) VALUES (3,2,"dopravce","Ondřej Ringešt");
 INSERT INTO Crew (ID,conveyorID,passwd,name) VALUES (4,2,"dopravce","Jaromír Skup");

 INSERT INTO Admin (ID,name,passwd) VALUES (1,"louda","tajny");
 INSERT INTO Admin (ID,name,passwd) VALUES (2,"kuli","tajny");
 
 INSERT INTO Passenger (ID,name,passwd,registered) VALUES (1,"Petr Dobrouk","heslo",TRUE);
 INSERT INTO Passenger (ID,name,passwd,registered) VALUES (2,"Marek Pomyslny","heslo",TRUE);
 INSERT INTO Passenger (ID,name,passwd,registered) VALUES (3,"Zlatana Kvetna","heslo",TRUE);

 INSERT INTO Reservation (ID,connectionID,passengerID,paid) VALUES (1,100,1,FALSE);
 INSERT INTO Reservation (ID,connectionID,passengerID,paid) VALUES (2,102,2,FALSE);
 
 INSERT INTO Reservation_seat (reservationID,seat) VALUES (1,1);
 INSERT INTO Reservation_seat (reservationID,seat) VALUES (1,2);
 
 INSERT INTO Reservation_seat (reservationID,seat) VALUES (2,1);
