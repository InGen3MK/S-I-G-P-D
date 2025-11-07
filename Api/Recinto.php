<?php
// Modelo para la entidad 'recinto' y el log asociado
class Recinto
{
    private $conn;
    private $table = 'recinto';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Crea una nueva recinto y devuelve el id insertado o false
    public function create($idTablero, $nombreRecinto)
    {
        try {
            $query = "INSERT INTO {$this->table} (id_tablero, nombre_recinto) VALUES (:id_tablero, :nombre_recinto)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_tablero', $idTablero);
            $stmt->bindParam(':nombre_recinto', $nombreRecinto);
            $stmt->execute();


            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            return false;
        }
    }

}

?>