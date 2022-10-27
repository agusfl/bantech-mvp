-- SQL script that creates the database and populate it.

-- Create the database "bantech_dev" and table "user" if not exists

CREATE DATABASE IF NOT EXISTS bantech_dev;
USE bantech_dev;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(5) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(20) COLLATE utf8_unicode_ci NOT NULL UNIQUE,
  `password` char(255) COLLATE utf8_unicode_ci NOT NULL,
  `fullname` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `token` varchar(100) COLLATE utf8_unicode_ci
);

-- Create table "bank_link"

CREATE TABLE IF NOT EXISTS `bank_link` (
`link_id` VARCHAR (255) NOT NULL,
`bank` VARCHAR(255) NOT NULL,
`user_id` int(5) UNSIGNED NOT NULL,
FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Populate table "user"

INSERT INTO `user` (`id`, `username`, `password`, `fullname`, `email`) VALUES
(1, 'juanma_reyess', 'pbkdf2:sha256:260000$gtNhZWSgps0s7o83$809b3a87e36c8cb10e5765f99014ca9bdaf2fb9786cfc6e976e75bc4102b3af2', 'Juan Reyes', 'juanmanuelreyesarrambide@gmail.com');

INSERT INTO `user` (`id`, `username`, `password`, `fullname`, `email`) VALUES
(2, 'agusfl', 'pbkdf2:sha256:260000$gtNhZWSgps0s7o83$809b3a87e36c8cb10e5765f99014ca9bdaf2fb9786cfc6e976e75bc4102b3af2', 'Agustin Flom', 'agusfl@gmail.com');

-- Populate table "bank_link"

INSERT INTO `bank_link` (`link_id`, `link_id`, `user_id`) VALUES
('98df78bc-6238-4c37-a549-d70d0b017fa8', 'BBVA', 1);

INSERT INTO `bank_link` (`link_id`, `link_id`, `user_id`) VALUES
('5aba454f-41ca-470b-ab4e-1028a083185c', 'BROU', 2);