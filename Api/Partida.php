<?php
// Modelo para la entidad 'partida' y el log asociado
require_once 'Tablero.php';
require_once 'Recinto.php';
require_once 'Utiliza.php';


class Partida
{
    private $tablero;
    private $recinto;
    private $conn;
    private $table = 'partida';

    public function __construct($db)
    {

        $this->conn = $db;
    }

    // Crea una nueva partida y devuelve el id insertado o false
    public function create($puntuacion, $ganador, $tableroData)
    {
        try {
            $query = "INSERT INTO {$this->table} (puntuacion, ganador) VALUES (:puntuacion, :ganador)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':puntuacion', $puntuacion);
            $stmt->bindParam(':ganador', $ganador);
            $stmt->execute();

            $idPartida = $this->conn->lastInsertId();
            $tablero = new Tablero($this->conn);
            $idTablero = $tablero->create($idPartida);

            $utiliza = new Utiliza($this->conn);
            foreach ($tableroData as $nombreRecinto => $dinosaurios) {
                // Crear el recinto usando el nombre de la clave
                $recinto = new Recinto($this->conn);

                $idRecinto = $recinto->create($idTablero, $nombreRecinto);

                foreach ($dinosaurios as $dino) {
                    $utiliza = new Utiliza($this->conn);

                    $utiliza->create($idRecinto, $dino);
                }
            }


            return $idPartida;
        } catch (PDOException $e) {
            return false;
        }
    }

    // Guarda el log de movimientos en la tabla partida_log (crea la tabla si no existe)
    // Nota: no guardamos el log de movimientos en la base de datos según
    // la petición del proyecto. Si en futuro se desea, aquí podría ir
    // la implementación para persistir logs.

    // (Opcional) Validar que el ganador exista en la tabla usuarios
    public function winnerExists($nickname)
    {
        try {
            $q = "SELECT id_usuario FROM usuarios WHERE nickname = :nickname";
            $s = $this->conn->prepare($q);
            $s->bindParam(':nickname', $nickname, PDO::PARAM_STR);
            $s->execute();
            $r = $s->fetch(PDO::FETCH_ASSOC);
            return $r ? true : false;
        } catch (PDOException $e) {
            return false;
        }
    }
}

?>