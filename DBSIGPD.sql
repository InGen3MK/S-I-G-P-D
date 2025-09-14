CREATE DATABASE DBSIGPD;

USE DBSIGPD;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL,
    gmail VARCHAR(150) NOT NULL,
    contraseña VARCHAR(50) NOT NULL
);
CREATE TABLE partida (
    id_partida INT AUTO_INCREMENT PRIMARY KEY,
    cantidad_jugadores VARCHAR(100) NOT NULL,
    ganador VARCHAR(150) NOT NULL
);
CREATE TABLE juegan (
    id_juegan INT AUTO_INCREMENT PRIMARY KEY
);
CREATE TABLE tablero (
    id_tablero INT AUTO_INCREMENT PRIMARY KEY,
    lado VARCHAR(100) NOT NULL
);
CREATE TABLE zona (
    id_zona INT AUTO_INCREMENT PRIMARY KEY,
    nombre_zona VARCHAR(100) NOT NULL
);
CREATE TABLE recinto (
    id_recinto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_recinto VARCHAR(100) NOT NULL
);
CREATE TABLE forma (
    id_forma INT AUTO_INCREMENT PRIMARY KEY
);
CREATE TABLE piezas (
    id_pieza INT AUTO_INCREMENT PRIMARY KEY,
   color VARCHAR(100) NOT NULL,
   forma VARCHAR(150) NOT NULL
);

INSERT INTO usuarios (id_usuario, nickname, gmail, contraseña) VALUES
	('1', 'kevin146', 'kevinrafaelmirpupo@gmail.com', 'kevin123'),
    ('2', 'javier257', 'javierleiva257@gmail.com', 'javi123'),
    ('3', 'ignacio368', 'nachiitoo2007@gmail.com', 'nacho123'),
    ('4', 'rodrigo479', 'rodrigo27021@gmail.com', 'rodri123');