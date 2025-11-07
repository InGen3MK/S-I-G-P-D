<?php
// Modelo para la entidad 'tablero' y el log asociado
class Tablero
{
    private $conn;
    private $table = 'tablero';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Crea una nueva tablero y devuelve el id insertado o false
    public function create($idPartida)
    {
        try {
            $query = "INSERT INTO {$this->table} (id_partida) VALUES (:id_partida)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_partida', $idPartida);
            $stmt->execute();


            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            return false;
        }
    }

}

?>