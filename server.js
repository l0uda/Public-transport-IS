const path = require("path");
const express = require("express");
const app = express();
const PORT = 8000;
var router = express.Router();
var mysql = require('mysql');
const { json } = require("stream/consumers");

var spoje = {};
var id = 0;




// setup using body-parser (is integrated in express itself?) for POST requests
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// var pool  = mysql.createPool({
//     connectionLimit : 10,
//     host            : '85.208.51.209',
//     user            : 'loudik',
//     password        : 'popici',
//     database        : 'iis_db'
//   });

 var pool  = mysql.createPool({
     connectionLimit : 10,
     host            : 'localhost',
     user            : 'root',
     password        : '',
     database        : 'iis_db',
    //  database        : 'backup',
     port            : 3306
   });

//var pool  = mysql.createPool({
 //   connectionLimit : 10,
   // host            : '85.208.51.209',
   // user            : 'kuli_home',
   /// password        : 'secret',
    // database        : 'iis_db',
   // database        : 'backup',
 // });



kvery = (query) => {
    return new Promise((resolve,reject) =>{
        pool.query(query, (error, results) => {
            if (error) return reject(error);
            return resolve(results);
        });
    });
}

// parameterized queries (used by the newer routes)
q = (query, params) => {
    return new Promise((resolve,reject) =>{
        pool.query(query, params || [], (error, results) => {
            if (error) return reject(error);
            return resolve(results);
        });
    });
}

qconn = (conn, query, params) => {
    return new Promise((resolve,reject) =>{
        conn.query(query, params || [], (error, results) => {
            if (error) return reject(error);
            return resolve(results);
        });
    });
}

withTransaction = (fn) => {
    return new Promise((resolve,reject) =>{
        pool.getConnection((err, conn) => {
            if (err) return reject(err);
            conn.beginTransaction((btErr) => {
                if (btErr) { conn.release(); return reject(btErr); }
                Promise.resolve()
                    .then(() => fn(conn))
                    .then((result) => conn.commit((cErr) => {
                        conn.release();
                        if (cErr) return reject(cErr);
                        resolve(result);
                    }))
                    .catch((e) => conn.rollback(() => { conn.release(); reject(e); }));
            });
        });
    });
}

// add middleware -- static files can now be used from frontend
app.use(express.static("client/build"));


// ROUTES FOR OUR API
// =============================================================================

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('approaching API');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8000/api)
router.get('/', function(req, res){
    res.json({m: "eyo"});
});


// USER MANAGEMENT API
router.route('/read_and_subsequently_possibly_config_if_desired_or_not_if_not_necessary_or_not_desired')

    .get(async function(req, res) {
        var persons = [];
        try{
            var results = await kvery('SELECT ID, name FROM Admin');
            for (let person of results){
                persons.push({ID: person.ID, name: person.name, type: "admin"});
            }        

            results = await kvery('SELECT ID, firm FROM Conveyor');
            for (let person of results){
                persons.push({ID: person.ID, name: person.firm, type: "conveyor"});
            }

            results = await kvery('SELECT ID, name FROM Crew');
            for (let person of results){
                persons.push({ID: person.ID, name: person.name, type: "crew"});
            }

            results = await kvery('SELECT ID, name FROM Passenger WHERE registered=TRUE');
            for (let person of results){
                persons.push({ID: person.ID, name: person.name, type: "passenger"});
            }

            console.log("ouu",persons);
            res.json(persons);
        } catch(e) {
            console.log(e);
        }
    })

router.route('/passenger_manage')
    .get(async function(req, res){
        var result = await kvery('SELECT * FROM Passenger WHERE registered=TRUE');
        res.json(result)
    })
    .post(async function(req, res) {
        await kvery('INSERT INTO Passenger(name,passwd,registered) VALUES (\"'+req.query.name+'\",\"'+req.query.passwd+'\",'+req.query.registered+');');
        res.json({msg: "sup"})
    })
    
    .put(async function(req, res) {
        await kvery('UPDATE Passenger SET name = \"'+req.query.name+'\", passwd = \"'+req.query.passwd+'\" WHERE ID='+req.query.ID+', registered = '+req.query.registered+';');
        res.json({msg: "sup"})
    })

    .delete(async function(req, res) {
        await kvery('DELETE FROM Passenger WHERE name='+req.query.name+';');
        res.json({msg: "sup"})
    })

router.route('/crew_manage')
    .get(async function(req, res) {
        var result = await kvery('SELECT Crew.ID, Crew.name, Crew.passwd FROM Crew, Conveyor WHERE Conveyor.firm = "'+req.query.firm+'" AND Crew.conveyorID = Conveyor.ID;');
        res.json(result)
})
    .post(async function(req, res) {
        await kvery('INSERT INTO Crew(name,passwd,conveyorID) VALUES (\"'+req.query.name+'\",\"'+req.query.passwd+'\",\"'+req.query.conveyorID+'\");');
    })
    
    .put(async function(req, res) {
        await kvery('UPDATE Crew SET name = \"'+req.query.name+'\", passwd = \"'+req.query.passwd+'\", conveyorID = \"'+req.query.conveyorID+'\" WHERE ID='+req.query.ID+';');
    })

    .delete(async function(req, res) {
        await kvery('DELETE FROM Crew WHERE firm='+req.query.name+';');
    })

router.route('/conveyor_manage')
    .get(async function(req, res) {
        var result = await kvery('SELECT * FROM Conveyor;');
        res.json(result)
    })

    .post(async function(req, res) {
        await kvery('INSERT INTO Conveyor(firm,passwd) VALUES (\"'+req.query.firm+'\",\"'+req.query.passwd+'\");');
    })
    
    .put(async function(req, res) {
        await kvery('UPDATE Conveyor SET firm = \"'+req.query.firm+'\", passwd = \"'+req.query.passwd+'\" WHERE ID='+req.query.ID+';');
    })

    .delete(async function(req, res) {
        await kvery('DELETE FROM Conveyor WHERE name='+req.query.name+';');
    })

router.route('/admin_manage')
    .get(async function(req, res) {
        var result = await kvery('SELECT * FROM Admin;');
        res.json(result)
    })
    .post(async function(req, res) {
        await kvery('INSERT INTO Admin(name,passwd) VALUES (\"'+req.query.name+'\",\"'+req.query.passwd+'\");');
    })
    
    .put(async function(req, res) {
        await kvery('UPDATE Admin SET name = \"'+req.query.name+'\", passwd = \"'+req.query.passwd+'\" WHERE ID='+req.query.ID+';');
    })

    .delete(async function(req, res) {
        await kvery('DELETE FROM Admin WHERE name='+req.query.name+';');
    })

router.route('/login')

    .post(async function(req, res) {
        var admins = await kvery('SELECT passwd,ID FROM Admin WHERE name=\"'+req.query.name+'\";');
        var conveyors = await kvery('SELECT passwd,ID FROM Conveyor WHERE firm=\"'+req.query.name+'\";');
        var crew = await kvery('SELECT passwd,ID FROM Crew WHERE name=\"'+req.query.name+'\";');
        var passengers = await kvery('SELECT passwd,ID FROM Passenger WHERE name=\"'+req.query.name+'\" AND registered = TRUE;');
        var answer = {};
        if (admins[0]){
            answer['ROLE']   = "admin";
            answer['ACCESS'] = admins[0].passwd == req.query.passwd ? "GRANTED" : "DENIED";
            answer['ID']     = admins[0].ID;
        }
        else if (conveyors[0]){
            answer['ROLE']   = "conveyor";
            answer['ACCESS'] = conveyors[0].passwd == req.query.passwd ? "GRANTED" : "DENIED";
            answer['ID']     = conveyors[0].ID;
        }
        else if (crew[0]){
            answer['ROLE']   = "crew";
            answer['ACCESS'] = crew[0].passwd == req.query.passwd ? "GRANTED" : "DENIED";
            answer['ID']     = crew[0].ID;
        }
        else if (passengers[0]){
            answer['ROLE']   = "passenger";
            answer['ACCESS'] = passengers[0].passwd == req.query.passwd ? "GRANTED" : "DENIED";
            answer['ID']     = passengers[0].ID;
        }
        else {
            answer['ROLE']   = "nenalezeno";
            answer['ACCESS'] = "DENIED"
            answer['ID']     = -1;
        }
        res.json(answer);
    })

// ANONYMOUS BOOKING / PASSENGER SELF-REGISTRATION

router.route('/anonymous_passenger')
    .post(async function(req, res) {
        try {
            var name = (req.query.name || '').trim();
            var email = (req.query.email || '').trim();

            if (!name || name.length > 45 || !email || email.length > 100 || email.indexOf('@') === -1){
                return res.status(400).json({msg: 'ERR'});
            }

            var result = await q('INSERT INTO Passenger(passwd, name, email, registered) VALUES (?, ?, ?, FALSE)',
                ['', name, email]);
            res.json({ID: result.insertId});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/passenger_register')
    .post(async function(req, res) {
        try {
            var ID = parseInt(req.query.ID);
            var passwd = req.query.passwd || '';

            if (!ID || !passwd || passwd.length > 100){
                return res.status(400).json({msg: 'ERR'});
            }

            var passenger = await q('SELECT ID, name, registered FROM Passenger WHERE ID = ?', [ID]);
            if (!passenger[0] || passenger[0].registered){
                return res.status(400).json({msg: 'ERR'});
            }

            var taken = await q('SELECT ID FROM Passenger WHERE name = ? AND registered = TRUE', [passenger[0].name]);
            if (taken[0]){
                return res.status(409).json({msg: 'ERR', error: 'Jméno je již zaregistrováno, přihlaste se prosím.'});
            }

            await q('UPDATE Passenger SET passwd = ?, registered = TRUE WHERE ID = ?', [passwd, ID]);
            res.json({msg: 'OK', ID: ID});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

// SPOJE MANAGEMENT API

router.route('/stops')
    .get(async function(req, res) {
        var result = await kvery('SELECT * FROM Stop WHERE ID='+req.query.ID+';');
        res.json(result);
    })
    .post(async function(req, res) {
        await kvery('INSERT INTO Stop(name,conveyorID,confirmed) VALUES (\"'+req.query.name+'\",'+req.query.conveyorID+',FALSE);');
    })

    .put(async function(req, res) {
        await kvery('UPDATE Stop SET name = \"'+req.query.name+'\", conveyorID = '+req.query.conveyorID+', confirmed = '+req.query.confirmed+' WHERE ID='+req.query.ID+';');
    })

    .delete(async function(req, res) {
        await kvery('DELETE FROM Stop WHERE name='+req.query.name+';');
    })


router.route('/stops_unconfirmed')
    .get(async function(req, res) {
        var results = await kvery('SELECT * FROM Stop WHERE confirmed is FALSE;');
        res.json(results);
    })

router.route('/confirm_stop')
    .post(async function(req, res) {
        await kvery('UPDATE Stop SET confirmed = TRUE WHERE ID='+req.query.ID+';');
    })

router.route('/vehicle')
    .get(async function(req, res) {
        var result = await kvery('SELECT * FROM Vehicle WHERE ID='+req.query.ID+';');
        res.json(result);
    })
    .post(async function(req, res) {
        await kvery('INSERT INTO Vehicle(max_seats_poor,max_seats_rich,description,last_visited,conveyorID) VALUES ('+req.query.max_seats_poor+', '+req.query.max_seats_rich+',\"'+req.query.description+'\",'+req.query.last_visited+','+req.query.conveyorID+');');
    })

    .put(async function(req, res) {
        await kvery('UPDATE Vehicle SET max_seats_poor = '+req.query.max_seats_poor+', max_seats_rich = '+req.query.max_seats_rich+', description = \"'+req.query.description+'\", last_visited = '+req.query.last_visited+', conveyorID = '+req.query.conveyorID+' WHERE ID='+req.query.ID+';');
    })

    .delete(async function(req, res) {
        await kvery('DELETE FROM Vehicle WHERE ID='+req.query.ID+';');
    })


router.route('/spoj')
    .get(async function(req, res) {
      var result = await kvery('SELECT * FROM Connection WHERE ID='+req.query.ID);
      res.json(result[0]);  
    })

router.route('/spoje')
    .get(async function(req, res) {
        var spoje = [];
        var result = await kvery('SELECT connID, arrival FROM Connection_stop AS CSS WHERE CSS.stopID IN (SELECT ID FROM Stop WHERE Stop.ID = stopID AND Stop.confirmed=true AND Stop.name = "'+req.query.odkud+'") AND CSS.connID IN (SELECT connID FROM Connection_stop CS WHERE CS.stopID IN (SELECT ID FROM Stop AS S WHERE S.confirmed=true AND S.name = "'+req.query.kam+'") AND TIMEDIFF(CSS.arrival, CS.arrival) < 0 AND TIMEDIFF(TIME("'+req.query.kdy+'"),CSS.arrival) < 0);');
        for (let spoj of result){
            var spojReturn = {}
            var result2 = await kvery('SELECT arrival FROM Connection_stop WHERE stopID IN (SELECT ID FROM Stop AS S WHERE S.name = "'+req.query.kam+'") AND connID = '+spoj.connID+';');
            var price = await kvery('SELECT sum(price_rich) AS cenaRich, sum(price_poor) AS cenaPoor FROM Connection, Connection_stop WHERE '+spoj.connID+' = Connection.ID AND Connection.ID = Connection_stop.connID AND TIMEDIFF(TIME("'+spoj.arrival+'"),arrival) <= 0 AND TIMEDIFF(TIME("'+result2[0].arrival+'"),arrival) > 0;');
            spojReturn['linka'] = spoj.connID;
            spojReturn['odjezd'] = spoj.arrival;
            spojReturn['odkud'] = req.query.odkud;
            spojReturn['prijezd'] = result2[0].arrival;
            spojReturn['kam'] = req.query.kam;
            spojReturn['cenaPoor'] = price[0].cenaPoor;
            spojReturn['cenaRich'] = price[0].cenaRich;
            spoje.push(spojReturn);
        }
        res.json(spoje);
    })
    .post(async function(req, res) {
        var conn = await kvery('INSERT INTO Connection(conveyorID,vehicleID,price_poor,price_rich) VALUES ('+req.query.conveyorID+', '+req.query.vehicleID+','+req.query.price_poor+','+req.query.price_rich+');');
        var zastavky = req.body.zastavky;
        for (let stop of zastavky){
            var ID = await kvery('SELECT ID FROM Stop WHERE name=\"'+stop.name+'\";')
            await kvery('INSERT INTO Connection_stop(connID,stopID,arrival) VALUES ('+conn.insertId+', '+ID[0].ID+', \"'+stop.cas+'\");');
        }       
        res.json({msg: "OK"});
    })

    .put(async function(req, res) {
        await kvery('UPDATE Vehicle SET max_seats_poor = '+req.query.max_seats_poor+', max_seats_rich = '+req.query.max_seats_rich+', description = \"'+req.query.description+'\", last_visited = '+req.query.last_visited+', conveyorID = '+req.query.conveyorID+' WHERE ID='+req.query.ID+';');
    })

    .delete(async function(req, res) {
        await kvery('DELETE FROM Vehicle WHERE ID='+req.query.ID+';');
    })

router.route('/gde_spoj')
    .get(async function(req, res) {        
        var result = await kvery('SELECT Stop.name FROM Vehicle, Stop WHERE Vehicle.last_visited = Stop.ID AND Vehicle.ID = '+req.query.ID+';');
        res.json(result)
    })        

router.route('/reservation')
    .get(async function(req, res) {
        var result = await kvery('SELECT * FROM Reservation WHERE ID = '+req.query.ID+';');
        res.json(result)
    })

    .post(async function(req, res){
        try {
            var connectionID = parseInt(req.query.connectionID);
            var passengerID = parseInt(req.query.passengerID);
            var cost = parseInt(req.query.cost);
            var paid = (req.query.paid === '1' || req.query.paid === 'true') ? 1 : 0;

            var seats = (req.query.seats || '').split(',')
                .map(function(s) { return parseInt(s); })
                .filter(function(s) { return !isNaN(s); });
            seats = [...new Set(seats)];

            if (!connectionID || !passengerID || isNaN(cost) || cost < 0 || seats.length === 0){
                return res.status(400).json({msg: 'ERR'});
            }

            // lock the seats, then write the reservation and the seat rows atomically
            var result = await withTransaction(async function(conn) {
                var veh = await qconn(conn, 'SELECT vehicleID FROM Connection WHERE ID = ?', [connectionID]);
                if (!veh[0]){
                    return {ok: false};
                }

                var passenger = await qconn(conn, 'SELECT ID FROM Passenger WHERE ID = ?', [passengerID]);
                if (!passenger[0]){
                    return {ok: false};
                }

                var placeholders = seats.map(function() { return '?'; }).join(',');
                var freeSeats = await qconn(conn,
                    'SELECT seat FROM Vehicle_seat WHERE vehicleID = ? AND seat IN ('+placeholders+') AND free = TRUE FOR UPDATE',
                    [veh[0].vehicleID, ...seats]);

                if (freeSeats.length !== seats.length){
                    return {ok: false};
                }

                var inserted = await qconn(conn,
                    'INSERT INTO Reservation(connectionID, passengerID, paid, cost) VALUES (?, ?, ?, ?)',
                    [connectionID, passengerID, paid, cost]);

                for (const seat of seats){
                    await qconn(conn, 'INSERT INTO Reservation_seat(reservationID, seat) VALUES (?, ?)', [inserted.insertId, seat]);
                    await qconn(conn, 'UPDATE Vehicle_seat SET free = FALSE WHERE vehicleID = ? AND seat = ?', [veh[0].vehicleID, seat]);
                }

                return {ok: true, ID: inserted.insertId};
            });

            if (!result.ok){
                return res.json({msg: 'ERR'});
            }
            res.json({msg: 'OK', ID: result.ID});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/free_vehicle_seats_poor')
    .get(async function(req, res) {
        var result = await kvery('SELECT seat FROM Vehicle_seat WHERE free=TRUE AND class=2 AND vehicleID ='+req.query.ID+';');
        res.json(result)
    })

router.route('/free_vehicle_seats_rich')
    .get(async function(req, res) {
        var result = await kvery('SELECT seat FROM Vehicle_seat WHERE free=TRUE AND class=1 AND vehicleID ='+req.query.ID+';');
        res.json(result)
    })

// Role hierarchy: admin > conveyor > crew > passenger > unregistered.
// These endpoints accept any of crewID / conveyorID / adminID; the higher
// roles act with the scope of the lower ones (admin = whole system).
async function resolveCarrierScope(req){
    var crewID = parseInt(req.query.crewID);
    if (crewID){
        var crew = await q('SELECT ID, name, conveyorID FROM Crew WHERE ID = ?', [crewID]);
        if (!crew[0]) return null;
        return { type: 'crew', name: crew[0].name, conveyorID: crew[0].conveyorID };
    }

    var conveyorID = parseInt(req.query.conveyorID);
    if (conveyorID){
        var conveyor = await q('SELECT ID, firm FROM Conveyor WHERE ID = ?', [conveyorID]);
        if (!conveyor[0]) return null;
        return { type: 'conveyor', name: conveyor[0].firm, conveyorID: conveyorID };
    }

    var adminID = parseInt(req.query.adminID);
    if (adminID){
        var admin = await q('SELECT ID, name FROM Admin WHERE ID = ?', [adminID]);
        if (!admin[0]) return null;
        return { type: 'admin', name: admin[0].name, conveyorID: null };
    }

    return null;
}

router.route('/reservation_confirm')

    .get(async function(req, res) {
        var result = await kvery('SELECT * FROM Reservation WHERE paid = FALSE;');
        res.json(result)
    })

    .post(async function(req, res) {
        try {
            var ID = parseInt(req.query.ID);
            if (!ID){
                return res.status(400).json({msg: 'ERR'});
            }

            var scope = await resolveCarrierScope(req);
            if (!scope){
                return res.status(403).json({msg: 'ERR'});
            }

            // crew/conveyor may only confirm reservations of their own carrier;
            // admin may confirm any
            var owned;
            if (scope.type === 'admin'){
                owned = await q('SELECT ID, passengerID FROM Reservation WHERE ID = ?', [ID]);
            } else {
                owned = await q(
                    'SELECT r.ID, r.passengerID FROM Reservation r '+
                    'JOIN Connection c ON c.ID = r.connectionID '+
                    'WHERE r.ID = ? AND c.conveyorID = ?', [ID, scope.conveyorID]);
            }
            if (!owned[0]){
                return res.status(403).json({msg: 'ERR'});
            }

            await q('UPDATE Reservation SET paid = TRUE WHERE ID = ?', [ID]);
            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

// CREW API

router.route('/crew_reservations')
    .get(async function(req, res) {
        try {
            var scope = await resolveCarrierScope(req);
            if (!scope){
                return res.status(403).json({msg: 'ERR'});
            }

            // cost: use the stored price when it exists (that is what the passenger
            // was charged); otherwise calculate it from the seat classes and the
            // connection prices (per segment over the whole route)
            var sql =
                'SELECT r.ID, r.paid, '+
                'COALESCE(r.cost, '+
                '  COALESCE(('+
                '    SELECT SUM(CASE vs.class WHEN 1 THEN c.price_rich ELSE c.price_poor END) '+
                '    FROM Reservation_seat rs '+
                '    JOIN Vehicle_seat vs ON vs.vehicleID = c.vehicleID AND vs.seat = rs.seat '+
                '    WHERE rs.reservationID = r.ID'+
                '  ), 0) * GREATEST((SELECT COUNT(*) FROM Connection_stop cs WHERE cs.connID = c.ID) - 1, 1)'+
                ') AS cost, '+
                'p.name AS passengerName, p.registered, r.connectionID, '+
                'v.description AS vehicle, co.firm AS carrier, '+
                '(SELECT GROUP_CONCAT(rs.seat ORDER BY rs.seat) FROM Reservation_seat rs WHERE rs.reservationID = r.ID) AS seats '+
                'FROM Reservation r '+
                'JOIN Passenger p ON p.ID = r.passengerID '+
                'JOIN Connection c ON c.ID = r.connectionID '+
                'JOIN Vehicle v ON v.ID = c.vehicleID '+
                'JOIN Conveyor co ON co.ID = c.conveyorID ';

            var params = [];
            if (scope.type !== 'admin'){
                sql += 'WHERE c.conveyorID = ? ';
                params.push(scope.conveyorID);
            }
            sql += 'ORDER BY r.paid ASC, r.ID ASC;';

            var reservations = await q(sql, params);
            res.json({scope: scope, reservations: reservations});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/crew_vehicles')
    .get(async function(req, res) {
        try {
            var scope = await resolveCarrierScope(req);
            if (!scope){
                return res.status(403).json({msg: 'ERR'});
            }

            var vehicleSql =
                'SELECT v.ID, v.description, v.last_visited, s.name AS last_stop, co.firm AS carrier '+
                'FROM Vehicle v '+
                'LEFT JOIN Stop s ON s.ID = v.last_visited '+
                'JOIN Conveyor co ON co.ID = v.conveyorID ';
            var vehicleParams = [];
            if (scope.type !== 'admin'){
                vehicleSql += 'WHERE v.conveyorID = ? ';
                vehicleParams.push(scope.conveyorID);
            }
            vehicleSql += 'ORDER BY co.firm ASC, v.ID ASC;';

            var stopSql =
                'SELECT DISTINCT st.ID, st.name '+
                'FROM Connection c '+
                'JOIN Connection_stop cs ON cs.connID = c.ID '+
                'JOIN Stop st ON st.ID = cs.stopID ';
            var stopParams = [];
            if (scope.type !== 'admin'){
                stopSql += 'WHERE c.conveyorID = ? ';
                stopParams.push(scope.conveyorID);
            }
            stopSql += 'ORDER BY st.name;';

            res.json({
                scope: scope,
                vehicles: await q(vehicleSql, vehicleParams),
                stops: await q(stopSql, stopParams)
            });
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/crew_position')
    .post(async function(req, res) {
        try {
            var vehicleID = parseInt(req.query.vehicleID);
            var stopID = parseInt(req.query.stopID);
            if (!vehicleID || !stopID){
                return res.status(400).json({msg: 'ERR'});
            }

            var scope = await resolveCarrierScope(req);
            if (!scope){
                return res.status(403).json({msg: 'ERR'});
            }

            var vehicle;
            if (scope.type === 'admin'){
                vehicle = await q('SELECT ID FROM Vehicle WHERE ID = ?', [vehicleID]);
            } else {
                vehicle = await q('SELECT ID FROM Vehicle WHERE ID = ? AND conveyorID = ?', [vehicleID, scope.conveyorID]);
            }
            if (!vehicle[0]){
                return res.status(403).json({msg: 'ERR'});
            }

            var stop = await q('SELECT ID FROM Stop WHERE ID = ?', [stopID]);
            if (!stop[0]){
                return res.status(400).json({msg: 'ERR'});
            }

            await q('UPDATE Vehicle SET last_visited = ? WHERE ID = ?', [stopID, vehicleID]);
            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/conveyor_crew')
    .get(async function(req, res) {
        try {
            var scope = await resolveCarrierScope(req);
            if (!scope){
                return res.status(403).json({msg: 'ERR'});
            }

            var sql =
                'SELECT c.ID, c.name, c.conveyorID, co.firm '+
                'FROM Crew c JOIN Conveyor co ON co.ID = c.conveyorID ';
            var params = [];
            if (scope.type !== 'admin'){
                sql += 'WHERE c.conveyorID = ? ';
                params.push(scope.conveyorID);
            }
            sql += 'ORDER BY co.firm ASC, c.name ASC;';

            res.json(await q(sql, params));
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

// CARRIER MANAGEMENT API - vehicles / connections / stops

async function carrierOf(req){
    var scope = await resolveCarrierScope(req);
    if (!scope || !scope.conveyorID) return null;
    return scope;
}

function timeToSeconds(value){
    var m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec((value || '').trim());
    if (!m) return null;
    var h = parseInt(m[1]), mi = parseInt(m[2]), s = parseInt(m[3] || '0');
    if (h > 23 || mi > 59 || s > 59) return null;
    return h * 3600 + mi * 60 + s;
}

function secondsToTime(total){
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    var pad = (n) => (n < 10 ? '0' : '') + n;
    return pad(h) + ':' + pad(m) + ':' + pad(s);
}

function normalizeStops(stops){
    if (!Array.isArray(stops) || stops.length < 2) return null;
    var result = [];
    var last = -1;
    for (var i = 0; i < stops.length; ++i){
        var stopID = parseInt(stops[i].stopID);
        var secs = timeToSeconds(stops[i].arrival);
        if (!stopID || secs === null || secs <= last) return null;
        last = secs;
        result.push({ stopID: stopID, arrival: secondsToTime(secs) });
    }
    var ids = result.map((r) => r.stopID);
    if (new Set(ids).size !== ids.length) return null;
    return result;
}

function insertVehicleSeats(conn, vehicleID, rich, poor){
    var work = Promise.resolve();
    for (let i = 1; i <= rich; ++i){
        work = work.then(() => qconn(conn,
            'INSERT INTO Vehicle_seat(vehicleID, seat, class, free) VALUES (?, ?, 1, TRUE)', [vehicleID, i]));
    }
    for (let i = 1; i <= poor; ++i){
        work = work.then(() => qconn(conn,
            'INSERT INTO Vehicle_seat(vehicleID, seat, class, free) VALUES (?, ?, 2, TRUE)', [vehicleID, rich + i]));
    }
    return work;
}

async function validateStops(stops){
    var ids = stops.map((s) => s.stopID);
    var placeholders = ids.map(() => '?').join(',');
    var found = await q('SELECT ID FROM Stop WHERE ID IN (' + placeholders + ') AND confirmed = TRUE', ids);
    return found.length === ids.length;
}

router.route('/confirmed_stops')
    .get(async function(req, res) {
        try {
            res.json(await q('SELECT ID, name FROM Stop WHERE confirmed = TRUE ORDER BY name'));
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

// --- vehicles ---

router.route('/conveyor_vehicles')
    .get(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            res.json(await q(
                'SELECT v.ID, v.description, v.max_seats_rich, v.max_seats_poor, v.last_visited, s.name AS last_stop, '+
                '(SELECT COUNT(*) FROM Vehicle_seat vs WHERE vs.vehicleID = v.ID) AS seat_count '+
                'FROM Vehicle v LEFT JOIN Stop s ON s.ID = v.last_visited '+
                'WHERE v.conveyorID = ? ORDER BY v.ID', [scope.conveyorID]));
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

    .post(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            var b = req.body || {};
            var rich = parseInt(b.max_seats_rich);
            var poor = parseInt(b.max_seats_poor);
            var description = (b.description || '').trim();

            if (isNaN(rich) || isNaN(poor) || rich < 0 || poor < 0 || rich + poor === 0 || rich + poor > 200 || description.length > 100){
                return res.status(400).json({msg: 'ERR'});
            }

            var id = await withTransaction(async function(conn) {
                var inserted = await qconn(conn,
                    'INSERT INTO Vehicle(max_seats_poor, max_seats_rich, description, last_visited, conveyorID) VALUES (?, ?, ?, NULL, ?)',
                    [poor, rich, description, scope.conveyorID]);
                await insertVehicleSeats(conn, inserted.insertId, rich, poor);
                return inserted.insertId;
            });

            res.json({msg: 'OK', ID: id});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/conveyor_vehicles/:id')
    .put(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            var id = parseInt(req.params.id);
            var current = await q('SELECT ID, max_seats_rich, max_seats_poor FROM Vehicle WHERE ID = ? AND conveyorID = ?', [id, scope.conveyorID]);
            if (!current[0]) return res.status(404).json({msg: 'ERR'});

            var b = req.body || {};
            var rich = parseInt(b.max_seats_rich);
            var poor = parseInt(b.max_seats_poor);
            var description = (b.description || '').trim();

            if (isNaN(rich) || isNaN(poor) || rich < 0 || poor < 0 || rich + poor === 0 || rich + poor > 200 || description.length > 100){
                return res.status(400).json({msg: 'ERR'});
            }

            var capacityChanged = (current[0].max_seats_rich !== rich || current[0].max_seats_poor !== poor);
            if (capacityChanged){
                var used = await q('SELECT COUNT(*) AS n FROM Reservation r JOIN Connection c ON c.ID = r.connectionID WHERE c.vehicleID = ?', [id]);
                if (used[0].n > 0){
                    return res.status(409).json({msg: 'ERR', error: 'Vozidlo má rezervace, kapacitu nelze měnit'});
                }
            }

            await withTransaction(async function(conn) {
                await qconn(conn, 'UPDATE Vehicle SET max_seats_poor = ?, max_seats_rich = ?, description = ? WHERE ID = ?',
                    [poor, rich, description, id]);
                if (capacityChanged){
                    await qconn(conn, 'DELETE FROM Vehicle_seat WHERE vehicleID = ?', [id]);
                    await insertVehicleSeats(conn, id, rich, poor);
                }
            });

            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

    .delete(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            var id = parseInt(req.params.id);
            var current = await q('SELECT ID FROM Vehicle WHERE ID = ? AND conveyorID = ?', [id, scope.conveyorID]);
            if (!current[0]) return res.status(404).json({msg: 'ERR'});

            var used = await q('SELECT COUNT(*) AS n FROM Connection WHERE vehicleID = ?', [id]);
            if (used[0].n > 0){
                return res.status(409).json({msg: 'ERR', error: 'Vozidlo je použité ve spojích, nelze smazat'});
            }

            await withTransaction(async function(conn) {
                await qconn(conn, 'DELETE FROM Vehicle_seat WHERE vehicleID = ?', [id]);
                await qconn(conn, 'DELETE FROM Vehicle WHERE ID = ? AND conveyorID = ?', [id, scope.conveyorID]);
            });

            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

// --- connections ---

router.route('/conveyor_connections')
    .get(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            var connections = await q(
                'SELECT c.ID, c.vehicleID, c.price_poor, c.price_rich, v.description AS vehicle, '+
                '(SELECT COUNT(*) FROM Reservation r WHERE r.connectionID = c.ID) AS reservations '+
                'FROM Connection c LEFT JOIN Vehicle v ON v.ID = c.vehicleID '+
                'WHERE c.conveyorID = ? ORDER BY c.ID', [scope.conveyorID]);

            for (var connection of connections){
                connection.stops = await q(
                    'SELECT cs.stopID, cs.arrival, s.name FROM Connection_stop cs '+
                    'JOIN Stop s ON s.ID = cs.stopID WHERE cs.connID = ? ORDER BY cs.arrival', [connection.ID]);
            }

            res.json(connections);
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

    .post(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            var b = req.body || {};
            var vehicleID = parseInt(b.vehicleID);
            var rich = parseInt(b.price_rich);
            var poor = parseInt(b.price_poor);
            var stops = normalizeStops(b.stops);

            if (!vehicleID || isNaN(rich) || isNaN(poor) || rich < 0 || poor < 0 || !stops){
                return res.status(400).json({msg: 'ERR'});
            }

            var vehicle = await q('SELECT ID FROM Vehicle WHERE ID = ? AND conveyorID = ?', [vehicleID, scope.conveyorID]);
            if (!vehicle[0]) return res.status(400).json({msg: 'ERR'});
            if (!(await validateStops(stops))) return res.status(400).json({msg: 'ERR'});

            var id = await withTransaction(async function(conn) {
                var inserted = await qconn(conn,
                    'INSERT INTO Connection(conveyorID, vehicleID, price_poor, price_rich) VALUES (?, ?, ?, ?)',
                    [scope.conveyorID, vehicleID, poor, rich]);
                for (var s of stops){
                    await qconn(conn, 'INSERT INTO Connection_stop(connID, stopID, arrival) VALUES (?, ?, ?)',
                        [inserted.insertId, s.stopID, s.arrival]);
                }
                return inserted.insertId;
            });

            res.json({msg: 'OK', ID: id});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/conveyor_connections/:id')
    .put(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            var id = parseInt(req.params.id);
            var current = await q('SELECT ID FROM Connection WHERE ID = ? AND conveyorID = ?', [id, scope.conveyorID]);
            if (!current[0]) return res.status(404).json({msg: 'ERR'});

            var used = await q('SELECT COUNT(*) AS n FROM Reservation WHERE connectionID = ?', [id]);
            if (used[0].n > 0){
                return res.status(409).json({msg: 'ERR', error: 'Spoj má rezervace, nelze upravit'});
            }

            var b = req.body || {};
            var vehicleID = parseInt(b.vehicleID);
            var rich = parseInt(b.price_rich);
            var poor = parseInt(b.price_poor);
            var stops = normalizeStops(b.stops);

            if (!vehicleID || isNaN(rich) || isNaN(poor) || rich < 0 || poor < 0 || !stops){
                return res.status(400).json({msg: 'ERR'});
            }

            var vehicle = await q('SELECT ID FROM Vehicle WHERE ID = ? AND conveyorID = ?', [vehicleID, scope.conveyorID]);
            if (!vehicle[0]) return res.status(400).json({msg: 'ERR'});
            if (!(await validateStops(stops))) return res.status(400).json({msg: 'ERR'});

            await withTransaction(async function(conn) {
                await qconn(conn, 'UPDATE Connection SET vehicleID = ?, price_poor = ?, price_rich = ? WHERE ID = ?',
                    [vehicleID, poor, rich, id]);
                await qconn(conn, 'DELETE FROM Connection_stop WHERE connID = ?', [id]);
                for (var s of stops){
                    await qconn(conn, 'INSERT INTO Connection_stop(connID, stopID, arrival) VALUES (?, ?, ?)',
                        [id, s.stopID, s.arrival]);
                }
            });

            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

    .delete(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            var id = parseInt(req.params.id);
            var current = await q('SELECT ID FROM Connection WHERE ID = ? AND conveyorID = ?', [id, scope.conveyorID]);
            if (!current[0]) return res.status(404).json({msg: 'ERR'});

            var used = await q('SELECT COUNT(*) AS n FROM Reservation WHERE connectionID = ?', [id]);
            if (used[0].n > 0){
                return res.status(409).json({msg: 'ERR', error: 'Spoj má rezervace, nelze smazat'});
            }

            await withTransaction(async function(conn) {
                await qconn(conn, 'DELETE FROM Connection_stop WHERE connID = ?', [id]);
                await qconn(conn, 'DELETE FROM Connection WHERE ID = ?', [id]);
            });

            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

// --- stops ---

router.route('/conveyor_stops')
    .get(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            res.json(await q('SELECT ID, name, confirmed FROM Stop WHERE conveyorID = ? ORDER BY name', [scope.conveyorID]));
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

    .post(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            var name = ((req.body || {}).name || '').trim();
            if (!name || name.length > 45) return res.status(400).json({msg: 'ERR'});

            try {
                var inserted = await q('INSERT INTO Stop(name, conveyorID, confirmed) VALUES (?, ?, FALSE)', [name, scope.conveyorID]);
                res.json({msg: 'OK', ID: inserted.insertId});
            } catch(e) {
                if (e.code === 'ER_DUP_ENTRY'){
                    return res.status(409).json({msg: 'ERR', error: 'Zastávka s tímto názvem již existuje'});
                }
                throw e;
            }
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/conveyor_stops/:id')
    .put(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            var id = parseInt(req.params.id);
            var current = await q('SELECT ID FROM Stop WHERE ID = ? AND conveyorID = ?', [id, scope.conveyorID]);
            if (!current[0]) return res.status(404).json({msg: 'ERR'});

            var name = ((req.body || {}).name || '').trim();
            if (!name || name.length > 45) return res.status(400).json({msg: 'ERR'});

            try {
                await q('UPDATE Stop SET name = ?, confirmed = FALSE WHERE ID = ?', [name, id]);
                res.json({msg: 'OK'});
            } catch(e) {
                if (e.code === 'ER_DUP_ENTRY'){
                    return res.status(409).json({msg: 'ERR', error: 'Zastávka s tímto názvem již existuje'});
                }
                throw e;
            }
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

    .delete(async function(req, res) {
        try {
            var scope = await carrierOf(req);
            if (!scope) return res.status(403).json({msg: 'ERR'});

            var id = parseInt(req.params.id);
            var current = await q('SELECT ID FROM Stop WHERE ID = ? AND conveyorID = ?', [id, scope.conveyorID]);
            if (!current[0]) return res.status(404).json({msg: 'ERR'});

            var used = await q('SELECT COUNT(*) AS n FROM Connection_stop WHERE stopID = ?', [id]);
            if (used[0].n > 0){
                return res.status(409).json({msg: 'ERR', error: 'Zastávka je používána ve spojích, nelze smazat'});
            }

            await q('DELETE FROM Stop WHERE ID = ?', [id]);
            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

// ADMIN STOPS API

router.route('/admin_stops')
    .get(async function(req, res) {
        try {
            if (!(await getAdmin(req))) return res.status(403).json({msg: 'ERR'});

            res.json(await q(
                'SELECT s.ID, s.name, s.confirmed, s.conveyorID, co.firm '+
                'FROM Stop s JOIN Conveyor co ON co.ID = s.conveyorID '+
                'ORDER BY s.confirmed ASC, s.name ASC'));
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/admin_stops/:id')
    .post(async function(req, res) {
        try {
            if (!(await getAdmin(req))) return res.status(403).json({msg: 'ERR'});

            var id = parseInt(req.params.id);
            await q('UPDATE Stop SET confirmed = TRUE WHERE ID = ?', [id]);
            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

    .delete(async function(req, res) {
        try {
            if (!(await getAdmin(req))) return res.status(403).json({msg: 'ERR'});

            var id = parseInt(req.params.id);
            var used = await q('SELECT COUNT(*) AS n FROM Connection_stop WHERE stopID = ?', [id]);
            if (used[0].n > 0){
                return res.status(409).json({msg: 'ERR', error: 'Zastávka je používána ve spojích, nelze smazat'});
            }

            await q('DELETE FROM Stop WHERE ID = ?', [id]);
            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

// ADMIN USER MANAGEMENT API

const USER_TYPES = ['admin', 'conveyor', 'crew', 'passenger'];

async function getAdmin(req){
    var adminID = parseInt(req.query.adminID);
    if (!adminID) return null;
    var rows = await q('SELECT ID, name FROM Admin WHERE ID = ?', [adminID]);
    return rows[0] || null;
}

router.route('/users')
    .get(async function(req, res) {
        try {
            if (!(await getAdmin(req))) return res.status(403).json({msg: 'ERR'});

            var admins = await q("SELECT 'admin' AS type, ID, name, NULL AS email, NULL AS registered, NULL AS conveyorID, NULL AS detail FROM Admin");
            var conveyors = await q("SELECT 'conveyor' AS type, ID, firm AS name, NULL AS email, NULL AS registered, NULL AS conveyorID, NULL AS detail FROM Conveyor");
            var crew = await q("SELECT 'crew' AS type, c.ID, c.name, NULL AS email, NULL AS registered, c.conveyorID AS conveyorID, co.firm AS detail FROM Crew c LEFT JOIN Conveyor co ON co.ID = c.conveyorID");
            var passengers = await q("SELECT 'passenger' AS type, ID, name, email, registered, NULL AS conveyorID, NULL AS detail FROM Passenger");

            res.json([...admins, ...conveyors, ...crew, ...passengers]);
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/carriers')
    .get(async function(req, res) {
        try {
            if (!(await getAdmin(req))) return res.status(403).json({msg: 'ERR'});
            var rows = await q('SELECT ID, firm FROM Conveyor ORDER BY firm ASC');
            res.json(rows);
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/users/:type')
    .post(async function(req, res) {
        try {
            if (!(await getAdmin(req))) return res.status(403).json({msg: 'ERR'});

            var type = req.params.type;
            if (USER_TYPES.indexOf(type) === -1) return res.status(400).json({msg: 'ERR'});

            var b = req.body || {};

            if (type === 'admin'){
                if (!b.name || !b.passwd) return res.status(400).json({msg: 'ERR'});
                var inserted = await q('INSERT INTO Admin(name, passwd) VALUES (?, ?)', [b.name, b.passwd]);
                return res.json({msg: 'OK', ID: inserted.insertId});
            }

            if (type === 'conveyor'){
                if (!b.firm || !b.passwd) return res.status(400).json({msg: 'ERR'});
                var inserted = await q('INSERT INTO Conveyor(firm, passwd) VALUES (?, ?)', [b.firm, b.passwd]);
                return res.json({msg: 'OK', ID: inserted.insertId});
            }

            if (type === 'crew'){
                var carrierID = parseInt(b.conveyorID);
                if (!b.name || !b.passwd || !carrierID) return res.status(400).json({msg: 'ERR'});
                var carrier = await q('SELECT ID FROM Conveyor WHERE ID = ?', [carrierID]);
                if (!carrier[0]) return res.status(400).json({msg: 'ERR'});
                var inserted = await q('INSERT INTO Crew(name, passwd, conveyorID) VALUES (?, ?, ?)', [b.name, b.passwd, carrierID]);
                return res.json({msg: 'OK', ID: inserted.insertId});
            }

            if (!b.name || !b.passwd) return res.status(400).json({msg: 'ERR'});
            var registered = (b.registered === false || b.registered === 0 || b.registered === '0') ? 0 : 1;
            var inserted = await q('INSERT INTO Passenger(name, passwd, email, registered) VALUES (?, ?, ?, ?)',
                [b.name, b.passwd, b.email || null, registered]);
            res.json({msg: 'OK', ID: inserted.insertId});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/users/:type/:id')
    .put(async function(req, res) {
        try {
            if (!(await getAdmin(req))) return res.status(403).json({msg: 'ERR'});

            var type = req.params.type;
            var id = parseInt(req.params.id);
            if (USER_TYPES.indexOf(type) === -1 || !id) return res.status(400).json({msg: 'ERR'});

            var b = req.body || {};

            if (type === 'admin'){
                if (!b.name) return res.status(400).json({msg: 'ERR'});
                if (b.passwd) await q('UPDATE Admin SET name = ?, passwd = ? WHERE ID = ?', [b.name, b.passwd, id]);
                else await q('UPDATE Admin SET name = ? WHERE ID = ?', [b.name, id]);
            } else if (type === 'conveyor'){
                if (!b.firm) return res.status(400).json({msg: 'ERR'});
                if (b.passwd) await q('UPDATE Conveyor SET firm = ?, passwd = ? WHERE ID = ?', [b.firm, b.passwd, id]);
                else await q('UPDATE Conveyor SET firm = ? WHERE ID = ?', [b.firm, id]);
            } else if (type === 'crew'){
                var carrierID = parseInt(b.conveyorID);
                if (!b.name || !carrierID) return res.status(400).json({msg: 'ERR'});
                if (b.passwd) await q('UPDATE Crew SET name = ?, conveyorID = ?, passwd = ? WHERE ID = ?', [b.name, carrierID, b.passwd, id]);
                else await q('UPDATE Crew SET name = ?, conveyorID = ? WHERE ID = ?', [b.name, carrierID, id]);
            } else {
                if (!b.name) return res.status(400).json({msg: 'ERR'});
                var registered = (b.registered === false || b.registered === 0 || b.registered === '0') ? 0 : 1;
                if (b.passwd) await q('UPDATE Passenger SET name = ?, email = ?, registered = ?, passwd = ? WHERE ID = ?',
                    [b.name, b.email || null, registered, b.passwd, id]);
                else await q('UPDATE Passenger SET name = ?, email = ?, registered = ? WHERE ID = ?',
                    [b.name, b.email || null, registered, id]);
            }

            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

    .delete(async function(req, res) {
        try {
            if (!(await getAdmin(req))) return res.status(403).json({msg: 'ERR'});

            var type = req.params.type;
            var id = parseInt(req.params.id);
            if (USER_TYPES.indexOf(type) === -1 || !id) return res.status(400).json({msg: 'ERR'});

            if (type === 'admin'){
                await q('DELETE FROM Admin WHERE ID = ?', [id]);
            } else if (type === 'crew'){
                await q('DELETE FROM Crew WHERE ID = ?', [id]);
            } else if (type === 'passenger'){
                await withTransaction(async function(conn) {
                    var reservations = await qconn(conn,
                        'SELECT r.ID, c.vehicleID FROM Reservation r JOIN Connection c ON c.ID = r.connectionID WHERE r.passengerID = ?',
                        [id]);
                    for (const r of reservations){
                        var seats = await qconn(conn, 'SELECT seat FROM Reservation_seat WHERE reservationID = ?', [r.ID]);
                        for (const s of seats){
                            await qconn(conn, 'UPDATE Vehicle_seat SET free = TRUE WHERE vehicleID = ? AND seat = ?', [r.vehicleID, s.seat]);
                        }
                        await qconn(conn, 'DELETE FROM Reservation_seat WHERE reservationID = ?', [r.ID]);
                        await qconn(conn, 'DELETE FROM Reservation WHERE ID = ?', [r.ID]);
                    }
                    await qconn(conn, 'DELETE FROM Passenger WHERE ID = ?', [id]);
                });
            } else {
                // carrier: cascade everything it owns; stops used by other carriers
                // are reassigned to the alphabetically first carrier using them
                await withTransaction(async function(conn) {
                    var conveyor = await qconn(conn, 'SELECT ID FROM Conveyor WHERE ID = ?', [id]);
                    if (!conveyor[0]) return;

                    var sharedStops = await qconn(conn,
                        'SELECT DISTINCT s.ID AS stopID FROM Stop s '+
                        'JOIN Connection_stop cs ON cs.stopID = s.ID '+
                        'JOIN Connection c ON c.ID = cs.connID '+
                        'WHERE s.conveyorID = ? AND c.conveyorID <> ?', [id, id]);

                    for (const s of sharedStops){
                        var newOwner = await qconn(conn,
                            'SELECT c.conveyorID AS ID FROM Connection_stop cs '+
                            'JOIN Connection c ON c.ID = cs.connID '+
                            'JOIN Conveyor co ON co.ID = c.conveyorID '+
                            'WHERE cs.stopID = ? AND c.conveyorID <> ? '+
                            'ORDER BY co.firm ASC, co.ID ASC LIMIT 1', [s.stopID, id]);
                        if (newOwner[0]){
                            await qconn(conn, 'UPDATE Stop SET conveyorID = ? WHERE ID = ?', [newOwner[0].ID, s.stopID]);
                        }
                    }

                    var reservations = await qconn(conn,
                        'SELECT r.ID, c.vehicleID FROM Reservation r JOIN Connection c ON c.ID = r.connectionID WHERE c.conveyorID = ?',
                        [id]);
                    for (const r of reservations){
                        var seats = await qconn(conn, 'SELECT seat FROM Reservation_seat WHERE reservationID = ?', [r.ID]);
                        for (const s of seats){
                            await qconn(conn, 'UPDATE Vehicle_seat SET free = TRUE WHERE vehicleID = ? AND seat = ?', [r.vehicleID, s.seat]);
                        }
                        await qconn(conn, 'DELETE FROM Reservation_seat WHERE reservationID = ?', [r.ID]);
                        await qconn(conn, 'DELETE FROM Reservation WHERE ID = ?', [r.ID]);
                    }

                    await qconn(conn, 'DELETE cs FROM Connection_stop cs JOIN Connection c ON c.ID = cs.connID WHERE c.conveyorID = ?', [id]);
                    await qconn(conn, 'DELETE FROM Connection WHERE conveyorID = ?', [id]);

                    await qconn(conn, 'DELETE vs FROM Vehicle_seat vs JOIN Vehicle v ON v.ID = vs.vehicleID WHERE v.conveyorID = ?', [id]);
                    await qconn(conn, 'DELETE FROM Vehicle WHERE conveyorID = ?', [id]);

                    await qconn(conn, 'DELETE FROM Crew WHERE conveyorID = ?', [id]);

                    await qconn(conn, 'UPDATE Vehicle SET last_visited = NULL WHERE last_visited IN (SELECT ID FROM Stop WHERE conveyorID = ?)', [id]);
                    await qconn(conn, 'DELETE FROM Stop WHERE conveyorID = ?', [id]);

                    await qconn(conn, 'DELETE FROM Conveyor WHERE ID = ?', [id]);
                });
            }

            res.json({msg: 'OK'});
        } catch(e) {
            console.error(e);
            res.status(500).json({msg: 'ERR'});
        }
    })

router.route('/test')
    .get(async function(req, res) {
        var result = await kvery('SELECT * FROM Passenger;');
        res.json(result)
    })

    .post(async function(req, res) {
        await kvery('UPDATE Reservation SET paid = TRUE WHERE ID ='+req.query.ID+';');
        var result = await kvery('SELECT Reservation.passengerID AS RPID, Passenger.registered AS PBOOL FROM Reservation, Passenger WHERE Reservation.passengerID = Passenger.ID AND Reservation.ID ='+req.query.ID+';');
        if (result[0].PBOOL == "FALSE"){
            await kvery('DELETE FROM Passenger WHERE ID ='+result[0].RPID+';');
        }
    })
    
// all of our routes will be prefixed with /api
app.use('/api', router);


// https://stackoverflow.com/questions/54282344/how-does-express-and-react-routes-work-on-initial-get-request-from-browser
// /api is the connector to the backend, exclude anything that matches "/api"


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname,"client","build","index.html"));      
});

app.listen(PORT, () => {
  console.log("listening on port %s",PORT);
})
