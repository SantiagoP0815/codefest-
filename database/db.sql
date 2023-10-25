-- Crear la base de datos CodeFest
CREATE DATABASE CodeFest;

-- Usar la base de datos CodeFest
USE CodeFest;

-- Crear la tabla de usuarios
CREATE TABLE users (
  id INT(11) AUTO_INCREMENT NOT NULL,
  username VARCHAR(16) NOT NULL,
  password VARCHAR(40) NOT NULL, -- Suponiendo que las contraseñas se encriptarán con SHA1, lo que produce un hash de 40 caracteres
  fullname VARCHAR(100) NOT NULL,
  PRIMARY KEY (id) 
);

-- Crear la tabla de enlaces (links)
CREATE TABLE links (
  id INT(11) AUTO_INCREMENT NOT NULL,
  title VARCHAR(150) NOT NULL,
  url VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INT(11),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_links FOREIGN KEY (user_id) REFERENCES users(id),
  PRIMARY KEY (id) 
);

-- Crear la tabla de amigos (friends)
CREATE TABLE friends (
  id INT(11) AUTO_INCREMENT NOT NULL,
  title VARCHAR(150) NOT NULL,
  url VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INT(11),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_friends FOREIGN KEY (user_id) REFERENCES users(id),
  PRIMARY KEY (id) 
);
