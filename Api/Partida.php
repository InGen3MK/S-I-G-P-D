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

            //guardamos la ultima id del insert en idpartida
            $idPartida = $this->conn->lastInsertId();
            //traemos la clase tablero de tablero php
            $tablero = new Tablero($this->conn);
            //creamos la tabla tablero con idpartida como elemento
            $idTablero = $tablero->create($idPartida);

            //traemos la clase utiliza de utiliza php
            $utiliza = new Utiliza($this->conn);

            //recorre tablero data y guarda los valores
            foreach ($tableroData as $nombreRecinto => $dinosaurios) {
                // traemos la clase recinto de recinto php
                $recinto = new Recinto($this->conn);

                //creamos un recinto mandandole idtablero y nombrerecinto
                $idRecinto = $recinto->create($idTablero, $nombreRecinto);

                //recorremos el array de dinosaurios y guardamos los valores en dino
                foreach ($dinosaurios as $dino) {
                    //traemos la clase utiliza de utiliza php
                    $utiliza = new Utiliza($this->conn);
                    //creamos la tabla utiliza con los valores idrecinto y dino
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