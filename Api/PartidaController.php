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
        if (!isset($data['totalScore'])) {
            return ['success' => false, 'message' => 'Falta totalScore'];
        }
        $totalScore = intval($data['totalScore']);
        $winner = isset($data['winner']) ? $data['winner'] : '';

        // (Opcional) podríamos validar que winner exista en usuarios
        $exists = $this->model->winnerExists($winner);
        if (!$exists && $winner !== '') {
            return ['success' => false, 'message' => 'Usuario no encontrado'];
        }

        // Crear la partida
        $partidaId = $this->model->create($totalScore, $winner);
        if (!$partidaId) {
            return ['success' => false, 'message' => 'Error insertando partida'];
        }

        // No guardamos el movesLog en la base de datos por decisión del proyecto.
        // Simplemente devolvemos éxito con el id de partida.
        return ['success' => true, 'message' => 'Partida guardada', 'partidaId' => $partidaId];
    }
}

?>