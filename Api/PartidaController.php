<?php
// Controlador para operaciones relacionadas con partidas
require_once 'Partida.php';

class PartidaController
{
    private $model;

    public function __construct($db)
    {
        $this->model = new Partida($db);
    }

    // Guardar partida: recibe un arreglo con keys: totalScore, winner, movesLog
    public function guardarPartida($data)
    {
        // Validaciones básicas
        //pregunta si existe totalScore
        if (!isset($data['totalScore'])) {
            //si no existe totalscore devuelve Falta totalScore
            return ['success' => false, 'message' => 'Falta totalScore'];
        }
        //dice que totalscore es un entero 
        $totalScore = intval($data['totalScore']);
        //pregunta si existe winner, si existe devuelve winner si no existe devuelve vacio
        $winner = isset($data['winner']) ? $data['winner'] : '';
        //pregunta si existe tablero, si existe devuelve tablero si no existe devuelve array vacio
        $tablero = isset($data['tablero']) ? $data['tablero'] : [];

        //pregunta si el ganador existe en la base de datos
        $exists = $this->model->winnerExists($winner);
        //si no existe el ganador y winner no es vacio devuelve Usuario no encontrado
        if (!$exists && $winner !== '') {
            return ['success' => false, 'message' => 'Usuario no encontrado'];
        }

        // Crear la partida
        $partidaId = $this->model->create($totalScore, $winner, $tablero);
        //si no existe partidaId devuelve Error insertando partida
        if (!$partidaId) {
            return ['success' => false, 'message' => 'Error insertando partida'];
        }

        // Simplemente devolvemos éxito con el id de partida.
        return ['success' => true, 'message' => 'Partida guardada', 'partidaId' => $partidaId];
    }
}

?>