var mysql = require('./dbcon.js');
var express = require('express');
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var bodyParser = require('body-parser');
var session = require('express-session');

// set up express app
var app = express();

// set up bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set up handlebars
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('mysql', mysql);

// set session settings
app.use(session({ secret: 'secret', name: 'secret_name' }));

// serve public assets
app.use(express.static('public'));

//direct to home-page/index
app.get('/', function (req, res) {
    res.render('index');
});
// admin sign-in
app.get('/admin-sign-in', function (req, res) {
    res.render('admin-sign-in');
});

// admin sign-in
app.post('/admin-sign-in', function (req, res) {
    var email = req.body['sign_in_email'];
    var password = req.body['sign_in_password'];

    if (email != '' && password) {
        var query = "SELECT Admin_Account.admin_id, Admin_Account.admin_password, Admin_Account.contact_email, Admin_Account.contact_phone, Admin_Account.first_name, Admin_Account.last_name FROM Admin_Account " +
            "WHERE contact_email = ? AND admin_password = ? " +
            "LIMIT 1;";

        mysql.pool.query(query, [email, password], function (err, results) {
            if (err) {
                console.log(err);
            } else {
                if (results.length < 1) {
                    res.render('admin-sign-in');
                } else {
                    var admin = results[0];

                    req.session.admin_id = admin.admin_id;
                    req.session.email = admin.contact_email;

                    res.redirect('/admin-approval');
                }
            }
        });
    } else {
        res.render('admin-sign-in');
    }
});

// admin approval
app.get('/admin-approval', function (req, res) {
    // only allow admin users with a session
    if (req.session.admin_id) {
        var context = { organizations: [] };

        var pendingQuery = "SELECT Organization.organization_id, Organization.organization_name, Organization.contact_name, Organization.contact_url FROM Organization WHERE Organization.approved = 0";
        mysql.pool.query(pendingQuery, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                context.pending_organizations = results;
            }

            var approvedQuery = "SELECT Organization.organization_id, Organization.organization_name, Organization.contact_name, Organization.contact_url FROM Organization WHERE Organization.approved = 1";

            mysql.pool.query(approvedQuery, function (err, results) {
                if (err) {
                    console.log(err);
                } else {
                    context.approved_organizations = results;
                }

                res.render('admin-approval', context);
            });
        });

        // else redirect to admin sign-in
    } else {
        res.redirect('/admin-sign-in');
    }
});

app.post('/admin-approve', function (req, res) {
    // only allow admin users with a session
    if (req.session.admin_id) {
        var organizationId = req.body['organization_id'];

        var query = "UPDATE Organization SET approved = 1 WHERE Organization.organization_id = ?";
        mysql.pool.query(query, [organizationId], function (err, results) {
            if (err) {
                console.log(err);
            }

            res.redirect('admin-approval');
        });

        // else redirect to admin sign-in
    } else {
        res.redirect('/admin-sign-in');
    }
});

app.post('/admin-reject', function (req, res) {
    // only allow admin users with a session
    if (req.session.admin_id) {
        var organizationId = req.body['organization_id'];

        var query = "UPDATE Organization SET approved = 0 WHERE Organization.organization_id = ?";
        mysql.pool.query(query, [organizationId], function (err, results) {
            if (err) {
                console.log(err);
            }

            res.redirect('admin-approval');
        });

        // else redirect to admin sign-in
    } else {
        res.redirect('/admin-sign-in');
    }
})

//org create acct = submitted
app.get('/org-sign-up-submitted', function (req, res) {
    res.render('org-sign-up-submitted');
});

//display organization sign-up page (Create Account)
app.get('/org-sign-up', function (req, res) {
    res.render('org-sign-up');
});

//submit information to be approved by an administrator
app.post('/org-sign-up', function (req, res) {
    console.log(req.body);
    var sql = "INSERT INTO Organization (organization_name, address_num, address_street, address_state, address_zip, contact_email, contact_phone, contact_name, contact_url, organization_password) VALUES (?,?,?,?,?,?,?,?,?,?)";
    mysql.pool.query(sql, [req.body.organization_name, req.body.address_num, req.body.address_street, req.body.address_state, req.body.address_zip, req.body.contact_email, req.body.contact_phone, req.body.contact_name, req.body.contact_url, req.body.organization_password], function (error, fields) {
        if (error) {
            console.log(JSON.stringify(error))
        } else {
            res.redirect('/org-sign-up-submitted');
        }
    });
});

//display organization event creation page
app.get('/org-event-creation', function (req, res) {
    if (req.session.organization_id) {
        res.render('org-event-creation');
    } else {
        res.redirect('/org-sign-in');
    }
});

//org create event = submitted
app.get('/org-event-submitted', function (req, res) {
    if (req.session.organization_id) {
        res.render('org-event-submitted');
    } else {
        res.redirect('/org-sign-in');
    }
});

//submit information to create an event
app.post('/org-event-creation', function (req, res) {
    if (req.session.organization_id) {
        console.log(req.body);
        var sql = "INSERT INTO Event (fk_organization_id, event_name, address_num, address_street, address_state, address_zip, min_age, date_start, date_end, event_description, contact_email, contact_phone, contact_name, contact_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        mysql.pool.query(sql, [req.session.organization_id, req.body.event_name, req.body.address_num, req.body.address_street, req.body.address_state, req.body.address_zip, req.body.min_age, req.body.date_start, req.body.date_end, req.body.event_description, req.body.contact_email, req.body.contact_phone, req.body.contact_name, req.body.contact_url], function (error, fields) {
            if (error) {
                console.log(JSON.stringify(error))
            } else {
                res.redirect('/org-event-submitted');
            }
        });
    } else {
        res.redirect('/org-sign-in');
    }
});

// Display Organization sign-in page
app.get('/org-sign-in', function (req, res) {
    res.render('org-sign-in');
});

// Organization sign-in
app.post('/org-sign-in', function (req, res) {
    var email = req.body['sign_in_email'];
    var password = req.body['sign_in_password'];

    if (email != '' && password) {
        console.log("Logging in...");
        var query = "SELECT organization_id, contact_email FROM Organization ";
        query = query + "WHERE contact_email = ? AND organization_password = ? LIMIT 1;";

        mysql.pool.query(query, [email, password], function (err, results) {
            if (err) {
                console.log(err);
            } else {
                if (results.length < 1) {
                    res.render('org-sign-in');
                } else {
                    console.log("Match found");
                    var org = results[0];
                    console.log(org);
                    req.session.organization_id = org.organization_id;
                    req.session.email = org.contact_email;
                    //var someURL = '/org-profile/' + org.organization_id;
                    res.redirect('./org-profile');
                }
            }
        });
    } else {
        res.redirect('/org-sign-in');
    }
});

// Display Organization Profile page
app.get('/org-profile', function (req, res) {
    if (req.session.organization_id) {
        console.log("Displaying Ogranization Profile");
        var context = {};
        var query = "SELECT organization_name FROM Organization WHERE organization_id = ?";
        var inserts = [req.session.organization_id];
        mysql.pool.query(query, inserts, function (err, results) {
            if (err) {
                console.log(err);
                res.end();
            }
            console.log(results);
            context.org = results[0];
            console.log("Organizaiton to display:");
            console.log(context.org);
            res.render('org-profile', context);
        });
    } else {
        console.log("No valid session");
        res.redirect('/org-sign-in');
    }
});

// Display Edit Organization page
app.get('/org-profile-edit/', function (req, res) {
    if (req.session.organization_id) {
        var context = {};
        context.organization_id = req.session.organization_id;
        var query = "SELECT organization_name, address_num, address_street, address_state, address_zip, ";
        query = query + "contact_email, contact_phone, contact_name, contact_url, approved ";
        query = query + "FROM Organization WHERE ?";
        var inserts = [context.organization_id];
        mysql.pool.query(query, inserts, function (err, results) {
            if (err) {
                console.log(err);
                res.end();
            }
            context.org = results[0];
            console.log(context.org);
            res.render("org-profile-edit", context);
        });
    } else {
        res.redirect('/org-sign-in');
    }
});

// Update Organization
app.post('/update-organization', function (req, res) {
    // only allow admin users with a session
    if (req.session.organization_id) {
        var organizationId = req.body['organization_id'];
        console.log(req.body);
        // Parse address
        var orgAddress = req.body['address'];
        var numIndex = orgAddress.indexOf(" ");
        var address_num = orgAddress.slice(0, numIndex);
        var address_street = orgAddress.substr(numIndex + 1, (orgAddress.length - numIndex));
        console.log("Address sent with update:");
        console.log(address_num);
        console.log(address_street);

        var query = "UPDATE Organization SET address_num = ?, address_street = ?, address_state = ?, ";
        query = query + "address_zip = ?, contact_email = ?, contact_phone = ?, contact_name = ?, contact_url = ? ";
        query = query + " WHERE organization_id = ?;";
        var inserts = [address_num, address_street, req.body['address_state'], req.body['address_zip'], req.body['contact_email'], req.body['contact_phone'], req.body['contact_name'], req.body['contact_url'], organizationId];
        mysql.pool.query(query, inserts, function (err, results) {
            if (err) {
                console.log(err);
            }

            res.redirect("/org-profile");
        });
        // else redirect to admin sign-in
    } else {
        res.redirect('/org-sign-in');
    }
});

// View Organization Events Postings
app.get('/org-profile-postings', function (req, res) {
    if (req.session.organization_id) {
        var context = {};
        context.id = req.session.organization_id;

        var query = "SELECT E.event_id, E.event_name, E.address_num, E.address_street, E.address_state, E.address_zip, E.min_age, E.date_start, E.date_end, E.event_description, ";
        query = query + "E.contact_email, E.contact_phone, E.contact_name, E.contact_url, O.organization_id, O.organization_name, COUNT(EV.fk_volunteer_id) AS vol_count ";
        query = query + "FROM `Event` E INNER JOIN Organization O ON O.organization_id = E.fk_organization_id LEFT JOIN Event_Volunteer EV ON E.event_id = EV.fk_event_id ";
        query = query + "WHERE O.organization_id = ? GROUP BY E.event_id ORDER BY E.date_end ASC;";

        var inserts = [context.id];
        mysql.pool.query(query, inserts, function (err, results) {
            if (err) {
                console.log(err);
            }
            if (results[0]) {
                //Format dates
                results.forEach(function (someEvent) {
                    formatDate(someEvent);
                });
                context.org_name = results[0].organization_name;
                context.event = results;

                res.render("org-profile-postings", context);
            } else {
                res.redirect("/org-profile");
            }
        });
    } else {
        res.redirect('/org-sign-in');
    }
});

app.post('/org-event-cancel', function (req, res) {
    var eventId = req.body['event_id'];
    var query = "DELETE FROM Event WHERE event_id = ?";
    var eventParams = [eventId];
    mysql.pool.query(query, eventParams, function (err, results) {
        if (err) {
            console.log(err);
            res.status(400);
            res.end();
        }
        res.redirect('/org-profile-postings');
        //res.status(200).end();
    });
});

// sign up for volunteer account
app.get('/volunteer-sign-up', function (req, res) {
    res.render('volunteer-sign-up');
});

// volunteer sign in
app.get('/volunteer-sign-in', function (req, res) {
    res.render('volunteer-sign-in');
});

// find and set session for volunteer
app.post('/volunteer-sign-in', function (req, res) {
    var email = req.body['volunteer_email'];
    var password = req.body['volunteer_password'];

    if (email != '' && password != '') {
        console.log("Logging in...");

        var query = "SELECT volunteer_id, contact_email FROM Volunteer_Account WHERE contact_email = ? AND volunteer_password = ?";
        mysql.pool.query(query, [email, password], function (err, results) {
            if (err) {
                console.log(err);
            } else {
                if (results.length < 1) {
                    res.render('volunteer-sign-in');
                } else {
                    var volunteer = results[0];

                    req.session.volunteer_id = volunteer.volunteer_id;
                    req.session.volunteer_email = volunteer.contact_email;

                    res.redirect('/volunteer-profile');
                }
            }
        });
    } else {
        res.redirect('/volunteer-sign-in');
    }
});

// create volunteer account
app.post('/volunteer-sign-up', function (req, res) {
    var createQuery = "INSERT INTO Volunteer_Account (first_name, last_name, contact_phone, contact_email, volunteer_password) VALUES (?,?,?,?,?)";
    var volunteerParams = [req.body['volunteer_first_name'], req.body['volunteer_last_name'], req.body['volunteer_phone_number'], req.body['volunteer_email'], req.body['volunteer_password']];
    mysql.pool.query(createQuery, volunteerParams, function (error, results) {
        if (error) {
            console.log("Unable to create new volunteer");
            console.log(error);
            res.render("volunteer-sign-up");
        } else {
            var retrieveQuery = "SELECT volunteer_id, contact_email FROM Volunteer_Account WHERE volunteer_id = ?";
            mysql.pool.query(retrieveQuery, [results.insertId], function (error, results2) {
                if (results2.length < 1) {
                    res.redirect('volunteer-sign-up')
                } else {
                    var volunteer = results2[0];

                    req.session.volunteer_id = volunteer.volunteer_id;
                    req.session.volunteer_email = volunteer.contact_email;

                    res.redirect('/volunteer-profile');
                }
            });
        }
    });
});

// volunteer profile page
app.get('/volunteer-profile', function (req, res) {
    // only allow volunteer users with a session
    if (req.session.volunteer_id) {
        var context = {};
        context.volunteer_id = req.session.volunteer_id;

        var query = "SELECT first_name, last_name FROM Volunteer_Account WHERE volunteer_id = ?";
        mysql.pool.query(query, [context.volunteer_id], function (error, results) {
            if (error) {
                console.log(JSON.stringify(error))

                res.render("volunteer-sign-in");
            } else {
                if (results.length < 1) {
                    res.render('volunteer-sign-in');
                } else {
                    var volunteer = results[0];
                    context.volunteer_name = volunteer.first_name + " " + volunteer.last_name;

                    res.render('volunteer-profile', context);
                }
            }
        });
    } else {
        res.redirect('/')
    }
});

// volunteer update form
app.get('/volunteer-edit', function (req, res) {
    // only allow volunteer users with a session
    if (req.session.volunteer_id) {
        var context = {};
        context.volunteer_id = req.session.volunteer_id;

        var query = "SELECT first_name, last_name, contact_phone, contact_email, volunteer_password FROM Volunteer_Account WHERE volunteer_id = ?";
        mysql.pool.query(query, [context.volunteer_id], function (error, results) {
            if (error) {
                console.log(JSON.stringify(error))

                res.render("volunteer-sign-in");
            } else {
                if (results.length < 1) {
                    res.redirect('/')
                } else {
                    var volunteer = results[0];
                    context.volunteer_first_name = volunteer.first_name;
                    context.volunteer_last_name = volunteer.last_name;
                    context.volunteer_phone = volunteer.contact_phone;
                    context.volunteer_email = volunteer.contact_email;
                    context.volunteer_password = volunteer.volunteer_password;

                    res.render('volunteer-edit', context);
                }
            }
        });
    } else {
        res.redirect('/')
    }
});

// update volunteer
app.post('/volunteer-update', function (req, res) {
    // only allow volunteer users with a session
    if (req.session.volunteer_id) {
        var organizationId = req.session.volunteer_id
        var firstName = req.body['volunteer_first_name'];
        var lastName = req.body['volunteer_last_name'];
        var phone = req.body['volunteer_phone'];
        var email = req.body['volunteer_email'];
        var password = req.body['volunteer_password'];

        var query = "UPDATE Volunteer_Account SET first_name = ?, last_name = ?, contact_phone = ?, contact_email = ?, volunteer_password = ? WHERE volunteer_id = ? ";
        var volunteerParams = [req.body['volunteer_first_name'], req.body['volunteer_last_name'], req.body['volunteer_phone_number'], req.body['volunteer_email'], req.body['volunteer_password'], req.session.volunteer_id];
        mysql.pool.query(query, volunteerParams, function (err, results) {
            if (err) {
                console.log(err);
            }

            res.redirect("/volunteer-profile");
        });
    } else {
        res.redirect('/')
    }
});

function formatDate(someEvent) {
    var startDateString = someEvent.date_start.toString();
    var endDateString = someEvent.date_end.toString();
    //console.log(startDateString);
    var startDate = startDateString.slice(4, 16);
    var endDate = endDateString.slice(4, 16);
    if (startDate == endDate) {
        endDate = "";
    } else {
        endDate = " - " + endDate;
    }
    someEvent.date_start = startDate;
    someEvent.date_end = endDate;
}

// Display browse events page
app.get('/browse-events', function (req, res) {
    var callbackCount = 0;
    // Session is not required to browse events
    var context = {};
    if (session.volunteer_id) {
        context.volunteer_id = session.volunteer_id;
    } else {
        context.volunteer_id = 99999;
    }
    var query = "SELECT E.event_id, E.event_name, E.address_num, E.address_street, E.address_state, E.address_zip, E.min_age, E.date_start, E.date_end, E.event_description, ";
    query = query + "E.contact_email, E.contact_phone, E.contact_name, E.contact_url, O.organization_id, O.organization_name, COUNT(EV.fk_volunteer_id) AS vol_count ";
    query = query + "FROM `Event` E INNER JOIN Organization O ON O.organization_id = E.fk_organization_id LEFT JOIN Event_Volunteer EV ON E.event_id = EV.fk_event_id ";
    query = query + "WHERE E.date_start < (NOW()) AND E.date_end > (NOW()) AND O.approved = 1 GROUP BY E.event_id ORDER BY E.date_end ASC;";
    mysql.pool.query(query, [1], function (err, results) {
        if (err) {
            console.log(err);
        }
        console.log('Events returned:');
        console.log(results);

        //Format dates
        results.forEach(function (someEvent) {
            formatDate(someEvent);
        });

        context.event = results;
        console.log(context);
        res.render('browse-events', context);
    });
});

// Volunter signs up for event
app.post('/add-event-volunteer', function (req, res) {
    var eventId = req.body['fk_event_id'];
    var volunteerId = req.body['fk_volunteer_id'];
    var query = "INSERT INTO Event_Volunteer (fk_event_id, fk_volunteer_id) VALUES (?, ?);";
    var volunteerParams = [eventId, volunteerId];
    mysql.pool.query(query, volunteerParams, function (err, results) {
        if (err) {
            console.log(err);
            res.status(400);
            res.end();
        }
        res.status(200).end();
    });
});

// Event Details Page
app.get('/event-details/:id', function (req, res) {
    var context = {};
    var query = "SELECT E.event_id, E.event_name, E.address_num, E.address_street, E.address_state, E.address_zip, E.min_age, E.date_start, E.date_end, E.event_description, ";
    query = query + "E.contact_email, E.contact_phone, E.contact_name, E.contact_url, O.organization_id, O.organization_name, COUNT(EV.fk_volunteer_id) AS vol_count ";
    query = query + "FROM `Event` E INNER JOIN Organization O ON O.organization_id = E.fk_organization_id LEFT JOIN Event_Volunteer EV ON E.event_id = EV.fk_event_id ";
    query = query + "WHERE E.event_id = ?";
    var inserts = [req.params.id];
    mysql.pool.query(query, inserts, function (err, results) {
        if (err) {
            console.log(err);
        }
        if (results[0]) {
            context.event = results[0];

            // Format Dates
            var startDateString = context.event.date_start.toString();
            var endDateString = context.event.date_end.toString();
            //console.log(startDateString);
            var startDate = startDateString.slice(4, 16);
            var endDate = endDateString.slice(4, 16);
            if (startDate == endDate) {
                endDate = "";
            } else {
                endDate = " - " + endDate;
            }
            context.event.date_start = startDate;
            context.event.date_end = endDate;

            res.render('event-details', context);
        } else {
            res.render('404');
        }
    });
});

function getEvent(res, mysql, context, complete) {
    var query = "SELECT E.event_id, E.event_name, E.address_num, E.address_street, E.address_state, E.address_zip, E.min_age, E.date_start, E.date_end, E.event_description, ";
    query = query + "E.contact_email, E.contact_phone, E.contact_name, E.contact_url, O.organization_id, O.organization_name, COUNT(EV.fk_volunteer_id) AS vol_count ";
    query = query + "FROM `Event` E INNER JOIN Organization O ON O.organization_id = E.fk_organization_id LEFT JOIN Event_Volunteer EV ON E.event_id = EV.fk_event_id ";
    query = query + "WHERE E.event_id = ?";
    var inserts = context.id;
    mysql.pool.query(query, inserts, function (err, results) {
        if (err) {
            console.log(err);
        }
        console.log(results[0]);
        if (results[0]) {
            context.event = results[0];
            complete();
        } else {
            res.render('404');
        }
    });
}

function getEventSkills(res, mysql, context, complete) {
    console.log("Getting event skills");
    var query = "SELECT S.skill_id, S.skill_desc FROM `Skill` S INNER JOIN `Event_Skill` ES ON ES.fk_skill_id = S.skill_id WHERE ES.fk_event_id = ?";
    var inserts = context.id;
    mysql.pool.query(query, inserts, function (err, results) {
        if (err) {
            console.log(err);
        }
        
        //if (results[0]) {
            context.skill = results;
            //console.log("Event skills:");
            //console.log(context.skill);
            complete();
        //} else {
        //    res.render('404');
        //}
    });
}

function getAllSkills(res, mysql, context, complete) {
    var query = "SELECT skill_id, skill_desc FROM `Skill` WHERE ?";
    var inserts = 1;
    mysql.pool.query(query, inserts, function (err, results) {
        if (err) {
            console.log(err);
        }
        context.allSkills = results;
        complete();
    });
}

// Organization Edit Event Page
app.get('/org-event-edit/:id', function (req, res) {
    // Only allow if org user
    if (req.session.organization_id) {
        var callbackCount = 0;
        var context = {};
        context.id = req.params.id;

        // Data queries
        getEvent(res, mysql, context, complete);
        getEventSkills(res, mysql, context, complete);
        getAllSkills(res, mysql, context, complete);

        // Callback funciton to execute when each query finishes
        function complete() {
            callbackCount++;
            if (callbackCount >= 3) {
                res.render('org-event-edit', context);
            }
        }
    } else {
        // If not org user, redirect to org sign in
        res.redirect('/org-sign-in');
    } 
});

function eventUpdate(req, res, mysql, context, complete) {
    // Parse address into database values
    var someAddress = req.body.address;
    var addressNum = someAddress.slice(0, someAddress.indexOf(' '));
    var addressStreet = someAddress.substr(someAddress.indexOf(' ') + 1);

    // Update event
    var query = "UPDATE `Event` SET event_name = ?, address_num = ?, address_street = ?, address_state = ?, address_zip = ?, min_age = ?, ";
    query = query + "date_start = ?, date_end = ?, event_description = ?, contact_phone = ?, contact_email = ?, contact_name = ?, contact_url = ? WHERE event_id = ? ";
    var eventParams = [req.body['event_name'], addressNum, addressStreet, req.body['address_state'], req.body['address_zip'], req.body['min_age'], req.body['date_start'], req.body['date_end'], req.body['event_description'], req.body['contact_phone'], req.body['contact_email'], req.body['contact_name'], req.body['contact_url'], req.body['event_id']];
    // Submit SQL query to update event
    mysql.pool.query(query, eventParams, function (err, results) {
        if (err) {
            console.log(err);
        }
        callbackCount = 0;
        // Update all related skills
        if (req.body['all_skills_Food Service']) {
            query = "INSERT INTO `Event_Skill` (fk_event_id, fk_skill_id) VALUES (?, ?)";
            var inserts = [req.body['event_id'], req.body['all_skills_Food Service']];
            mysql.pool.query(query, inserts, function (err, results) {
                if (err) {
                    console.log(err);
                }
                allDone(complete);
            });
        } else {
            query = "DELETE FROM `Event_Skill` WHERE fk_skill_id = ?";
            var inserts = [req.body['all_skills_Food Service']];
            mysql.pool.query(query, inserts, function (err, results) {
                if (err) {
                    console.log(err);
                }
                allDone(complete);
            });
        }

        if (req.body['all_skills_Elderly Care']) {
            query = "INSERT INTO `Event_Skill` (fk_event_id, fk_skill_id) VALUES (?, ?)";
            var inserts = [req.body['event_id'], req.body['all_skills_Elderly Care']];
            mysql.pool.query(query, inserts, function (err, results) {
                if (err) {
                    console.log(err);
                }
                allDone(complete);
            });
        } else {
            query = "DELETE FROM `Event_Skill` WHERE fk_skill_id = ?";
            var inserts = [req.body['all_skills_Elderly Care']];
            mysql.pool.query(query, inserts, function (err, results) {
                if (err) {
                    console.log(err);
                }
                allDone(complete);
            });
        }

        if (req.body['all_skills_Construction']) {
            query = "INSERT INTO `Event_Skill` (fk_event_id, fk_skill_id) VALUES (?, ?)";
            var inserts = [req.body['event_id'], req.body['all_skills_Construction']];
            mysql.pool.query(query, inserts, function (err, results) {
                if (err) {
                    console.log(err);
                }
                allDone(complete);
            });
        } else {
            query = "DELETE FROM `Event_Skill` WHERE fk_skill_id = ?";
            var inserts = [req.body['all_skills_Construction']];
            mysql.pool.query(query, inserts, function (err, results) {
                if (err) {
                    console.log(err);
                }
                allDone(complete);
            });
        }
        if (req.body['all_skills_Youth Mentorship']) {
            query = "INSERT INTO `Event_Skill` (fk_event_id, fk_skill_id) VALUES (?, ?)";
            var inserts = [req.body['event_id'], req.body['all_skills_Youth Mentorship']];
            mysql.pool.query(query, inserts, function (err, results) {
                if (err) {
                    console.log(err);
                }
                allDone(complete);
            });
        } else {
            query = "DELETE FROM `Event_Skill` WHERE fk_skill_id = ?";
            var inserts = [req.body['all_skills_Youth Mentorship']];
            mysql.pool.query(query, inserts, function (err, results) {
                if (err) {
                    console.log(err);
                }
                allDone(complete);
            });
        }

        if (req.body['all_skills_Cleanup']) {
            query = "INSERT INTO `Event_Skill` (fk_event_id, fk_skill_id) VALUES (?, ?)";
            var inserts = [req.body['event_id'], req.body['all_skills_Cleanup']];
            mysql.pool.query(query, inserts, function (err, results) {
                if (err) {
                    console.log(err);
                }
                allDone(complete);
            });
        } else {
            query = "DELETE FROM `Event_Skill` WHERE fk_skill_id = ?";
            var inserts = [req.body['all_skills_Cleanup']];
            mysql.pool.query(query, inserts, function (err, results) {
                if (err) {
                    console.log(err);
                }
                allDone(complete);
            });
        }


        function allDone(complete) {
            console.log("All done");
            callbackCount++;
            if (callbackCount >= 5) {
                console.log("Returning")
                complete();
            }
        }
    });
}
app.post('/event-update', function (req, res) {
    // only allow volunteer users with a session
    if (req.session.organization_id) {
        var callbackCount = 0;
	var context = {};
        context.id = req.session.organization_id;

        // Data queries
        eventUpdate(req, res, mysql, context, complete);

        // Callback funciton to run when queries complete
        function complete() {
            // Navigate to the Organization Postings page
            res.redirect("/org-profile-postings");
        }
    } else {
        res.redirect('/org-sign-in')
    }
});
// start server
app.listen(6889, function () {
    console.log('Server started on port 6889; press Ctrl-C to terminate.');
});
