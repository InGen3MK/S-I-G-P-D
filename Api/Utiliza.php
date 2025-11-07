<?php
// Modelo para la entidad 'utiliza' y el log asociado
class Utiliza
{
    private $conn;
    private $table = 'utiliza';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Crea una nueva utiliza y devuelve el id insertado o false
    public function create($idRecinto, $dinosaurio)
    {
        try {
            $query = "INSERT INTO {$this->table} (id_recinto, dinosaurio) VALUES (:id_recinto, :dinosaurio)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_recinto', $idRecinto);
            $stmt->bindParam(':dinosaurio', $dinosaurio);
            $stmt->execute();


            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            return false;
        }
    }

}

?>