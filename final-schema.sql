-- phpMyAdmin SQL Dump
-- version 4.8.1
-- https://www.phpmyadmin.net/
--
-- Host: classmysql.engr.oregonstate.edu:3306
-- Generation Time: Jun 05, 2018 at 04:34 PM
-- Server version: 10.1.22-MariaDB
-- PHP Version: 7.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cs361_vanoverc`
--

-- --------------------------------------------------------

--
-- Table structure for table `Admin_Account`
--

CREATE TABLE `Admin_Account` (
  `admin_id` int(10) UNSIGNED NOT NULL,
  `admin_password` varchar(255) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `fk_organization_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Admin_Account`
--

INSERT INTO `Admin_Account` (`admin_id`, `admin_password`, `contact_email`, `contact_phone`, `first_name`, `last_name`, `fk_organization_id`) VALUES
(1, 'password', 'vanoverc@oregonstate.edu', '123-456-7890', 'colin', 'vano', 1),
(2, 'password', 'admin@example.com', '111-111-1111', 'admin', 'admin', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Event`
--

CREATE TABLE `Event` (
  `event_id` int(10) UNSIGNED NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `address_num` int(10) UNSIGNED DEFAULT NULL,
  `address_street` varchar(255) DEFAULT NULL,
  `address_state` varchar(255) DEFAULT NULL,
  `address_zip` int(10) UNSIGNED DEFAULT NULL,
  `min_age` int(10) UNSIGNED DEFAULT NULL,
  `date_start` date DEFAULT NULL,
  `date_end` date DEFAULT NULL,
  `event_description` varchar(8000) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_url` varchar(255) DEFAULT NULL,
  `fk_organization_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Event`
--

INSERT INTO `Event` (`event_id`, `event_name`, `address_num`, `address_street`, `address_state`, `address_zip`, `min_age`, `date_start`, `date_end`, `event_description`, `contact_email`, `contact_phone`, `contact_name`, `contact_url`, `fk_organization_id`) VALUES
(1, 'Test Event 1', 123, 'Dead End', 'CO', 80226, 21, '2018-03-04', '2018-07-04', 'Here is a description', 'someContact@example.com', '123-456-7890', 'someone', 'http://www.espn.com', 1),
(2, 'Test Event 2', 3467, 'Another Street', 'CA', 90124, 12, '2018-01-31', '2019-04-01', 'This is another test event', 'somebody@example.com', '123-832-2789', 'this person', 'http://www.google.com', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Event_Volunteer`
--

CREATE TABLE `Event_Volunteer` (
  `fk_event_id` int(10) UNSIGNED NOT NULL,
  `fk_volunteer_id` int(10) UNSIGNED NOT NULL,
  `status` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Organization`
--

CREATE TABLE `Organization` (
  `organization_id` int(10) UNSIGNED NOT NULL,
  `organization_name` varchar(255) NOT NULL,
  `organization_password` varchar(255) NOT NULL,
  `address_num` int(10) UNSIGNED DEFAULT NULL,
  `address_street` varchar(255) DEFAULT NULL,
  `address_state` varchar(255) DEFAULT NULL,
  `address_zip` int(10) UNSIGNED DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_url` varchar(255) NOT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Organization`
--

INSERT INTO `Organization` (`organization_id`, `organization_name`, `organization_password`, `address_num`, `address_street`, `address_state`, `address_zip`, `contact_email`, `contact_phone`, `contact_name`, `contact_url`, `approved`) VALUES
(1, 'Colin\'s Test Org', 'password', 123, 'Some Street', 'CO', 45678, 'vanoverc@oregonstate.edu', '123-456-7890', 'Colin', 'http://www.google.com', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Volunteer_Account`
--

CREATE TABLE `Volunteer_Account` (
  `volunteer_id` int(10) UNSIGNED NOT NULL,
  `volunteer_password` varchar(255) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Admin_Account`
--
ALTER TABLE `Admin_Account`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `Event`
--
ALTER TABLE `Event`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `fk_organization_id` (`fk_organization_id`);

--
-- Indexes for table `Event_Volunteer`
--
ALTER TABLE `Event_Volunteer`
  ADD PRIMARY KEY (`fk_event_id`,`fk_volunteer_id`),
  ADD KEY `fk_volunteer_id` (`fk_volunteer_id`);

--
-- Indexes for table `Organization`
--
ALTER TABLE `Organization`
  ADD PRIMARY KEY (`organization_id`);

--
-- Indexes for table `Volunteer_Account`
--
ALTER TABLE `Volunteer_Account`
  ADD PRIMARY KEY (`volunteer_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Admin_Account`
--
ALTER TABLE `Admin_Account`
  MODIFY `admin_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Event`
--
ALTER TABLE `Event`
  MODIFY `event_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Organization`
--
ALTER TABLE `Organization`
  MODIFY `organization_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Volunteer_Account`
--
ALTER TABLE `Volunteer_Account`
  MODIFY `volunteer_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Event`
--
ALTER TABLE `Event`
  ADD CONSTRAINT `Event_ibfk_1` FOREIGN KEY (`fk_organization_id`) REFERENCES `Organization` (`organization_id`) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Constraints for table `Event_Volunteer`
--
ALTER TABLE `Event_Volunteer`
  ADD CONSTRAINT `Event_Volunteer_ibfk_1` FOREIGN KEY (`fk_event_id`) REFERENCES `Event` (`event_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  ADD CONSTRAINT `Event_Volunteer_ibfk_2` FOREIGN KEY (`fk_volunteer_id`) REFERENCES `Volunteer_Account` (`volunteer_id`) ON UPDATE CASCADE ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
