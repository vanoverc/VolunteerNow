-- CS 361 Group Project
-- Rich Reese
-- OSU ID: 930668354

DROP TABLE IF EXISTS `Event_Volunteer`;
DROP TABLE IF EXISTS `Event`;
DROP TABLE IF EXISTS `Volunteer_Account`;
DROP TABLE IF EXISTS `Admin_Account`;
DROP TABLE IF EXISTS `Organization`;


--
-- Table structure for table `Organization`
--

CREATE TABLE Organization (
  organization_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  organization_name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  address_num INT UNSIGNED,
  address_street VARCHAR(255),
  address_state VARCHAR(255),
  address_zip INT UNSIGNED,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(255),
  contact_name VARCHAR(255),
  contact_url VARCHAR(255) NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `Volunteer_Account`
--

CREATE TABLE Volunteer_Account (
  volunteer_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  password VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  PRIMARY KEY (volunteer_id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `Admin_Account`
--

CREATE TABLE Admin_Account (
  admin_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  password VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  fk_organization_id INT UNSIGNED,
  PRIMARY KEY (admin_id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `Event`
--

CREATE TABLE Event (
  event_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_name VARCHAR(255) NOT NULL,
  address_num INT UNSIGNED,
  address_street VARCHAR(255),
  address_state VARCHAR(255),
  address_zip INT UNSIGNED,
  min_age int UNSIGNED,
  date_start DATE,
  date_end DATE,
  description VARCHAR(8000),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(255),
  contact_name VARCHAR(255),
  contact_url VARCHAR(255),
  fk_organization_id INT UNSIGNED,
  PRIMARY KEY (event_id),
  FOREIGN KEY (fk_organization_id) REFERENCES Organization (organization_id) ON DELETE RESTRICT ON UPDATE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `Event_Volunteer`
--

CREATE TABLE Event_Volunteer (
  fk_event_id INT UNSIGNED NOT NULL,
  fk_volunteer_id INT UNSIGNED NOT NULL,
  status VARCHAR(255),
  FOREIGN KEY (fk_event_id) REFERENCES Event (event_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (fk_volunteer_id) REFERENCES Volunteer_Account (volunteer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  PRIMARY KEY (fk_event_id,fk_volunteer_id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;