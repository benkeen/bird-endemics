-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: May 14, 2017 at 12:25 AM
-- Server version: 5.6.35
-- PHP Version: 5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `endemics`
--

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` int(11) NOT NULL,
  `country_code` mediumtext NOT NULL,
  `country_name` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `country_species`
--

CREATE TABLE `country_species` (
  `country_species_id` int(11) NOT NULL,
  `country_code` varchar(10) NOT NULL,
  `common_name` varchar(255) NOT NULL,
  `sci_name` varchar(255) NOT NULL,
  `num_obs` int(11) NOT NULL,
  `over_threshold` enum('yes','no') NOT NULL DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `rare_sightings`
--

CREATE TABLE `rare_sightings` (
  `sighting_id` int(11) NOT NULL,
  `country_species_id` int(11) NOT NULL,
  `row_data` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `country_species`
--
ALTER TABLE `country_species`
  ADD PRIMARY KEY (`country_species_id`,`country_code`,`sci_name`);

--
-- Indexes for table `rare_sightings`
--
ALTER TABLE `rare_sightings`
  ADD PRIMARY KEY (`sighting_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT for table `country_species`
--
ALTER TABLE `country_species`
  MODIFY `country_species_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `rare_sightings`
--
ALTER TABLE `rare_sightings`
  MODIFY `sighting_id` int(11) NOT NULL AUTO_INCREMENT;
