<?php
// Modelo para la entidad 'recinto' y el log asociado
class Ranking
{
    private $conn;
    private $table = 'partida';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Crea una nueva recinto y devuelve el id insertado o false
    public function select($idTablero, $nombreRecinto)
    {
        try {
            $query = "SELECT ganador, puntuacion FROM $this->$table ORDER BY puntuacion DESC LIMIT 5;
";
            $stmt = $this->conn->prepare($query);
            // $stmt->bindParam(':id_tablero', $idTablero);
            // $stmt->bindParam(':nombre_recinto', $nombreRecinto);
            $stmt->execute();


            return select();
        } catch (PDOException $e) {
            return false;
        }
    }

}

?>