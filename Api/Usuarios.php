<?php
// Definimos la clase Animal, que nos permitirá interactuar con la tabla 'animales' de la base de datos
class Usuarios
{
    // Propiedad privada para almacenar la conexión a la base de datos
    private $conn;
    // Propiedad privada que contiene el nickname de la tabla a usar
    private $table = "usuarios";

    // El constructor recibe una conexión a la base de datos y la guarda en la propiedad $conn
    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Método para obtener todos los registros de animales de la base de datos
    public function getAll()
    {
        // Creamos la consulta SQL para seleccionar los campos deseados de la tabla 'animales'
        $query = "SELECT id_usuario, nickname, contraseña, gmail FROM {$this->table}";
        // Preparamos la consulta usando la conexión a la base de datos para evitar inyecciones SQL
        $stmt = $this->conn->prepare($query);
        // Ejecutamos la consulta preparada
        $stmt->execute();
        // Obtenemos todos los resultados como un array asociativo y lo devolvemos
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Método para obtener un animal específico por su ID
    public function getByName($nickname)
    {
        // Creamos la consulta SQL con un marcador de posición para el ID
        $query = "SELECT id_usuario,nickname,contraseña FROM {$this->table} WHERE nickname = :nickname";
        // Preparamos la consulta usando la conexión a la base de datos
        $stmt = $this->conn->prepare($query);
        // Asociamos el valor recibido en $id al marcador ':id' en la consulta, asegurando que sea un entero
        $stmt->bindParam(":nickname", $nickname, PDO::PARAM_STR);
        // Ejecutamos la consulta preparada
        $stmt->execute();
        // Obtenemos el resultado como un array asociativo (solo un registro) y lo devolvemos
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function insertarUsuario($id_partida, $jugadores, $puntaj, $ganador)
    {
        // Creamos la consulta SQL con dos marcadores de posición para los parametros a ingresar
        $query = "INSERT INTO Partida(id_partida, cantidad_jugadores, ganador) VALUES (:id_partida, :jugadores, :ganador);";
        // Preparamos la consulta usando la conexión a la base de datos
        $stmt = $this->conn->prepare($query);
        // Asociamos los valores de los marcadores con las variables que recibimos
        $stmt->bindParam(":id_partida", $id_partida, PDO::PARAM_STR);

        $stmt->bindParam(":jugadores", $jugadores, PDO::PARAM_INT);

        $stmt->bindParam(":ganador", $ganador, PDO::PARAM_INT);
        // Ejecutamos la consulta preparada y devolvemos el ID insertado si tiene éxito
        if ($stmt->execute()) {
            // retorna el último id de la tabla a insertar en la base de datos
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
